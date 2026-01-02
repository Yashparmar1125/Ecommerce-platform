from decimal import Decimal
from django.db import transaction
from apps.orders.models import Order, OrderItem
from apps.products.models import Product, ProductSKU
from apps.users.models import Address
from rest_framework.exceptions import ValidationError


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
            
            # Check stock availability
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
        
        # Create order
        order = Order.objects.create(
            user=user,
            total=total,
            address=address,
            status=Order.PENDING
        )
        
        # Create order items and update SKU quantities
        for item_data in order_items:
            OrderItem.objects.create(
                order=order,
                product=item_data['product'],
                sku=item_data['sku'],
                quantity=item_data['quantity'],
                price=item_data['price']
            )
            
            # Update SKU quantity
            item_data['sku'].quantity -= item_data['quantity']
            item_data['sku'].save()
        
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

