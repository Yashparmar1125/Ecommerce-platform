from decimal import Decimal
from django.db import transaction
from django.db.models import F
from apps.orders.models import Order, OrderItem
from apps.products.models import Product, ProductSKU, Coupon, CouponUsage
from apps.users.models import Address
from rest_framework.exceptions import ValidationError
from django.utils import timezone
import logging

logger = logging.getLogger(__name__)


class OrderService:
    """Service for order operations - business logic separated from views"""
    
    @staticmethod
    @transaction.atomic
    def create_order(user, validated_data):
        """Create a new order with items"""
        address_id = validated_data.get('address_id')
        items_data = validated_data.get('items', [])
        
        # Get or create address
        address = None
        if address_id:
            try:
                address = Address.objects.get(id=address_id, user=user)
            except Address.DoesNotExist:
                raise ValidationError("Address not found")
        
        # Handle coupon if provided - use select_for_update to lock the coupon
        coupon = None
        coupon_discount = Decimal('0.00')
        coupon_code = validated_data.get('coupon_code')
        
        # Process coupon code if provided
        if coupon_code:
            # Normalize coupon code
            if isinstance(coupon_code, str):
                coupon_code = coupon_code.strip().upper()
            else:
                coupon_code = str(coupon_code).strip().upper()
            
            if coupon_code:  # Only proceed if code is not empty after normalization
                try:
                    # Use select_for_update to lock the coupon row during transaction
                    # This prevents race conditions when multiple users try to use the same coupon
                    coupon = Coupon.objects.select_for_update().get(
                        code=coupon_code, 
                        is_active=True
                    )
                    # Validate coupon
                    now = timezone.now()
                    if not (
                        coupon.valid_from <= now <= coupon.valid_until
                    ):
                        raise ValidationError("Coupon has expired or is not yet active")
                    
                    # Check usage limit with locked coupon
                    if coupon.usage_limit is not None and coupon.used_count >= coupon.usage_limit:
                        raise ValidationError("Coupon usage limit has been reached")
                except Coupon.DoesNotExist:
                    raise ValidationError(f"Invalid coupon code: {coupon_code}")
        
        # Calculate total and create order items
        total = Decimal('0.00')
        order_items = []
        
        for item_data in items_data:
            product_id = item_data['product_id']
            quantity = item_data['quantity']
            
            try:
                product = Product.objects.get(id=product_id)
            except Product.DoesNotExist:
                raise ValidationError(f"Product not found for product_id: {product_id}")
            
            # Get SKU - either by ID or by size/color
            sku = None
            if 'sku_id' in item_data and item_data['sku_id']:
                try:
                    sku = ProductSKU.objects.get(id=item_data['sku_id'], product=product)
                except ProductSKU.DoesNotExist:
                    raise ValidationError(f"SKU not found for sku_id: {item_data['sku_id']}")
            elif 'size' in item_data and 'color' in item_data:
                # Find SKU by size and color attributes
                from apps.products.models import ProductAttribute
                try:
                    size_attr = ProductAttribute.objects.get(value=item_data['size'], type='SIZE')
                    color_attr = ProductAttribute.objects.get(value=item_data['color'], type='COLOR')
                    sku = ProductSKU.objects.get(
                        product=product,
                        size_attribute=size_attr,
                        color_attribute=color_attr
                    )
                except (ProductAttribute.DoesNotExist, ProductSKU.DoesNotExist):
                    raise ValidationError(f"SKU not found for {product.name} - Size: {item_data.get('size')}, Color: {item_data.get('color')}")
            else:
                raise ValidationError("Either sku_id or size+color must be provided")
            
            # Lock SKU for update to prevent race conditions
            # Use select_for_update to ensure atomic inventory updates
            sku = ProductSKU.objects.select_for_update().get(id=sku.id)
            
            # Check stock availability with locked SKU
            if sku.quantity < quantity:
                raise ValidationError(f"Insufficient stock for {product.name}. Available: {sku.quantity}, Requested: {quantity}")
            
            # Calculate item total
            item_price = sku.price * quantity
            total += item_price
            
            order_items.append({
                'product': product,
                'sku': sku,
                'quantity': quantity,
                'price': sku.price
            })
        
        # Apply coupon discount if valid
        if coupon:
            # Convert min_purchase_amount to Decimal for comparison
            min_purchase = Decimal(str(coupon.min_purchase_amount))
            
            if total >= min_purchase:
                coupon_discount = coupon.calculate_discount(total)
                total = total - coupon_discount
                if total < 0:
                    total = Decimal('0.00')
            else:
                raise ValidationError(f"Minimum purchase amount of ₹{min_purchase} required for this coupon. Your total is ₹{total}")
        
        # Create order
        order = Order.objects.create(
            user=user,
            total=total,
            address=address,
            status=Order.PENDING
        )
        
        # Record coupon usage if coupon was applied and discount > 0
        # Note: We only record usage if discount was actually applied (discount > 0)
        # This ensures we don't count failed coupon attempts (e.g., total < min_purchase_amount)
        if coupon and coupon_discount > 0:
            logger.info(f"Recording coupon usage for {coupon.code}, discount: {coupon_discount}")
            
            # Double-check coupon is still valid before finalizing (prevent race conditions)
            coupon.refresh_from_db()
            logger.info(f"Coupon {coupon.code} - used_count before update: {coupon.used_count}, limit: {coupon.usage_limit}")
            
            if coupon.usage_limit is not None and coupon.used_count >= coupon.usage_limit:
                raise ValidationError("Coupon usage limit has been reached")
            
            # Create coupon usage record
            coupon_usage = CouponUsage.objects.create(
                coupon=coupon,
                user=user,
                order=order,
                discount_amount=coupon_discount
            )
            logger.info(f"Created CouponUsage record ID: {coupon_usage.id}")
            
            # Atomically update coupon used count using F() expression
            # This prevents race conditions when multiple orders use the same coupon
            # Use update() which returns the number of rows affected
            rows_updated = Coupon.objects.filter(id=coupon.id).update(
                used_count=F('used_count') + 1
            )
            logger.info(f"Updated coupon {coupon.id}, rows affected: {rows_updated}")
            
            # Verify update was successful
            if rows_updated == 0:
                logger.error(f"Failed to update coupon {coupon.id} usage count")
                raise ValidationError("Failed to update coupon usage count")
            
            # Refresh coupon to get updated count (for verification)
            coupon.refresh_from_db()
            logger.info(f"Coupon {coupon.code} - used_count after update: {coupon.used_count}")
        elif coupon:
            logger.warning(f"Coupon {coupon.code} was provided but discount is 0 (discount: {coupon_discount})")
        
        # Create order items and atomically update SKU quantities
        for item_data in order_items:
            OrderItem.objects.create(
                order=order,
                product=item_data['product'],
                sku=item_data['sku'],
                quantity=item_data['quantity'],
                price=item_data['price']
            )
            
            # Atomically update SKU quantity using F() expression
            # This prevents race conditions when multiple orders are placed simultaneously
            # and ensures inventory is always accurate
            ProductSKU.objects.filter(id=item_data['sku'].id).update(
                quantity=F('quantity') - item_data['quantity']
            )
            
            # Also update product in_stock status if needed
            # Check if any SKU for this product still has stock
            product = item_data['product']
            has_stock = ProductSKU.objects.filter(
                product=product,
                quantity__gt=0
            ).exists()
            
            if product.in_stock != has_stock:
                product.in_stock = has_stock
                product.save(update_fields=['in_stock'])
        
        return order
    
    @staticmethod
    def get_user_orders(user):
        """Get all orders for a user"""
        return Order.objects.filter(user=user).select_related('address').prefetch_related('items__product', 'items__sku').order_by('-created_at')
    
    @staticmethod
    def get_order(user, order_id):
        """Get a specific order for a user"""
        try:
            return Order.objects.select_related('address').prefetch_related('items__product', 'items__sku').get(id=order_id, user=user)
        except Order.DoesNotExist:
            return None
    
    @staticmethod
    @transaction.atomic
    def cancel_order(user, order_id):
        """Cancel an order and restore inventory"""
        try:
            order = Order.objects.select_for_update().select_related('address').prefetch_related(
                'items__product', 'items__sku'
            ).get(id=order_id, user=user)
        except Order.DoesNotExist:
            raise ValidationError("Order not found")
        
        # Only allow cancellation of pending or processing orders
        if order.status not in [Order.PENDING, Order.PROCESSING]:
            raise ValidationError(f"Cannot cancel order with status: {order.status}")
        
        # Restore inventory for all order items
        for item in order.items.all():
            # Atomically restore SKU quantity
            ProductSKU.objects.filter(id=item.sku.id).update(
                quantity=F('quantity') + item.quantity
            )
            
            # Update product in_stock status
            product = item.product
            has_stock = ProductSKU.objects.filter(
                product=product,
                quantity__gt=0
            ).exists()
            
            if product.in_stock != has_stock:
                product.in_stock = has_stock
                product.save(update_fields=['in_stock'])
        
        # Handle coupon usage if order had a coupon
        coupon_usage = CouponUsage.objects.filter(order=order).first()
        if coupon_usage:
            # Atomically decrement coupon used count
            Coupon.objects.filter(id=coupon_usage.coupon.id).update(
                used_count=F('used_count') - 1
            )
            # Delete coupon usage record
            coupon_usage.delete()
        
        # Update order status
        order.status = Order.CANCELLED
        order.save(update_fields=['status'])
        
        return order
    
    @staticmethod
    @transaction.atomic
    def update_order_status(order, new_status):
        """Update order status - handles inventory for cancellations"""
        old_status = order.status
        
        # If cancelling, restore inventory
        if new_status == Order.CANCELLED and old_status != Order.CANCELLED:
            # Restore inventory for all order items
            for item in order.items.all():
                ProductSKU.objects.filter(id=item.sku.id).update(
                    quantity=F('quantity') + item.quantity
                )
                
                # Update product in_stock status
                product = item.product
                has_stock = ProductSKU.objects.filter(
                    product=product,
                    quantity__gt=0
                ).exists()
                
                if product.in_stock != has_stock:
                    product.in_stock = has_stock
                    product.save(update_fields=['in_stock'])
            
            # Handle coupon usage if order had a coupon
            coupon_usage = CouponUsage.objects.filter(order=order).first()
            if coupon_usage:
                # Atomically decrement coupon used count
                Coupon.objects.filter(id=coupon_usage.coupon.id).update(
                    used_count=F('used_count') - 1
                )
                # Delete coupon usage record
                coupon_usage.delete()
        
        # If uncancelling (changing from cancelled to another status), deduct inventory again
        elif old_status == Order.CANCELLED and new_status != Order.CANCELLED:
            for item in order.items.all():
                # Lock SKU for update
                sku = ProductSKU.objects.select_for_update().get(id=item.sku.id)
                
                # Check if enough stock is available
                if sku.quantity < item.quantity:
                    raise ValidationError(f"Insufficient stock to restore order. Available: {sku.quantity}, Required: {item.quantity}")
                
                # Deduct inventory
                ProductSKU.objects.filter(id=item.sku.id).update(
                    quantity=F('quantity') - item.quantity
                )
                
                # Update product in_stock status
                product = item.product
                has_stock = ProductSKU.objects.filter(
                    product=product,
                    quantity__gt=0
                ).exists()
                
                if product.in_stock != has_stock:
                    product.in_stock = has_stock
                    product.save(update_fields=['in_stock'])
        
        order.status = new_status
        order.save(update_fields=['status'])
        return order

