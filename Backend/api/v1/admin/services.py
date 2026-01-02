from django.db.models import Sum, Count
from django.shortcuts import get_object_or_404
from django.contrib.auth import authenticate
from rest_framework.exceptions import AuthenticationFailed, PermissionDenied
from rest_framework_simplejwt.tokens import RefreshToken

from apps.products.models import Product, Category, ProductImage, ProductSKU, ProductAttribute
from apps.orders.models import Order
from apps.users.models import User


class AdminAuthService:
    """Service for admin authentication"""
    
    @staticmethod
    def authenticate_admin(username, password):
        """Authenticate admin user - must be superuser"""
        user = authenticate(username=username, password=password)
        
        if not user:
            raise AuthenticationFailed("Invalid username or password")
        
        if not user.is_active:
            raise PermissionDenied("Account is disabled")
        
        if not user.is_superuser:
            raise PermissionDenied("Admin privileges required. This account is not a superuser.")
        
        return user
    
    @staticmethod
    def generate_admin_tokens(user):
        """Generate JWT tokens for admin user"""
        refresh = RefreshToken.for_user(user)
        return {
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        }


class AdminDashboardService:
    """Service for admin dashboard statistics and data"""
    
    @staticmethod
    def get_dashboard_stats():
        """Get all dashboard statistics"""
        total_users = User.objects.count()
        total_products = Product.objects.count()
        total_orders = Order.objects.count()
        total_revenue = Order.objects.aggregate(
            total=Sum('total')
        )['total'] or 0
        pending_orders = Order.objects.filter(status='pending').count()
        
        # Get recent orders (last 10)
        recent_orders = Order.objects.select_related('user', 'address').prefetch_related(
            'items__product'
        ).order_by('-created_at')[:10]
        
        return {
            'total_users': total_users,
            'total_products': total_products,
            'total_orders': total_orders,
            'total_revenue': float(total_revenue) if total_revenue else 0.0,
            'pending_orders': pending_orders,
            'recent_orders': recent_orders
        }


class AdminProductService:
    """Service for product management operations"""
    
    @staticmethod
    def get_all_products():
        """Get all products with related data"""
        return Product.objects.select_related('category').prefetch_related('images', 'skus').all()
    
    @staticmethod
    def get_product_by_id(product_id):
        """Get a single product by ID"""
        return get_object_or_404(
            Product.objects.select_related('category').prefetch_related('images', 'skus'),
            id=product_id
        )
    
    @staticmethod
    def create_product(validated_data):
        """Create a new product"""
        images_data = validated_data.pop('images', [])
        skus_data = validated_data.pop('skus', [])
        product = Product.objects.create(**validated_data)
        
        # Create images
        for idx, image_data in enumerate(images_data):
            ProductImage.objects.create(
                product=product,
                image_url=image_data['image_url'],
                order=image_data.get('order', idx)
            )
        
        # Create SKUs
        for sku_data in skus_data:
            size_attr = None
            color_attr = None
            
            if sku_data.get('size_attribute_id'):
                try:
                    size_attr = ProductAttribute.objects.get(
                        id=sku_data['size_attribute_id'],
                        type=ProductAttribute.SIZE
                    )
                except ProductAttribute.DoesNotExist:
                    pass
            
            if sku_data.get('color_attribute_id'):
                try:
                    color_attr = ProductAttribute.objects.get(
                        id=sku_data['color_attribute_id'],
                        type=ProductAttribute.COLOR
                    )
                except ProductAttribute.DoesNotExist:
                    pass
            
            ProductSKU.objects.create(
                product=product,
                sku=sku_data['sku'],
                price=sku_data['price'],
                quantity=sku_data['quantity'],
                size_attribute=size_attr,
                color_attribute=color_attr
            )
        
        return product
    
    @staticmethod
    def update_product(product, validated_data):
        """Update an existing product"""
        images_data = validated_data.pop('images', None)
        skus_data = validated_data.pop('skus', None)
        
        for attr, value in validated_data.items():
            setattr(product, attr, value)
        product.save()
        
        if images_data is not None:
            # Delete existing images
            product.images.all().delete()
            # Create new images
            for idx, image_data in enumerate(images_data):
                ProductImage.objects.create(
                    product=product,
                    image_url=image_data['image_url'],
                    order=image_data.get('order', idx)
                )
        
        if skus_data is not None:
            # Delete existing SKUs
            product.skus.all().delete()
            # Create new SKUs
            for sku_data in skus_data:
                size_attr = None
                color_attr = None
                
                if sku_data.get('size_attribute_id'):
                    try:
                        size_attr = ProductAttribute.objects.get(
                            id=sku_data['size_attribute_id'],
                            type=ProductAttribute.SIZE
                        )
                    except ProductAttribute.DoesNotExist:
                        pass
                
                if sku_data.get('color_attribute_id'):
                    try:
                        color_attr = ProductAttribute.objects.get(
                            id=sku_data['color_attribute_id'],
                            type=ProductAttribute.COLOR
                        )
                    except ProductAttribute.DoesNotExist:
                        pass
                
                ProductSKU.objects.create(
                    product=product,
                    sku=sku_data['sku'],
                    price=sku_data['price'],
                    quantity=sku_data['quantity'],
                    size_attribute=size_attr,
                    color_attribute=color_attr
                )
        
        return product
    
    @staticmethod
    def delete_product(product_id):
        """Delete a product by ID"""
        product = get_object_or_404(Product, id=product_id)
        product.delete()
        return product


class AdminCategoryService:
    """Service for category management operations"""
    
    @staticmethod
    def get_all_categories():
        """Get all categories"""
        return Category.objects.all()
    
    @staticmethod
    def get_category_by_id(category_id):
        """Get a single category by ID"""
        return get_object_or_404(Category, id=category_id)
    
    @staticmethod
    def create_category(validated_data):
        """Create a new category"""
        return Category.objects.create(**validated_data)
    
    @staticmethod
    def update_category(category, validated_data):
        """Update an existing category"""
        for attr, value in validated_data.items():
            setattr(category, attr, value)
        category.save()
        return category
    
    @staticmethod
    def delete_category(category_id):
        """Delete a category by ID"""
        category = get_object_or_404(Category, id=category_id)
        category.delete()
        return category


class AdminOrderService:
    """Service for order management operations"""
    
    @staticmethod
    def get_all_orders(status_filter=None):
        """Get all orders, optionally filtered by status"""
        orders = Order.objects.select_related('user', 'address').prefetch_related(
            'items__product'
        ).order_by('-created_at')
        
        if status_filter:
            orders = orders.filter(status=status_filter)
        
        return orders
    
    @staticmethod
    def get_order_by_id(order_id):
        """Get a single order by ID"""
        return get_object_or_404(
            Order.objects.select_related('user', 'address').prefetch_related('items__product'),
            id=order_id
        )
    
    @staticmethod
    def update_order_status(order, new_status):
        """Update the status of an order"""
        order.status = new_status
        order.save()
        return order


class AdminUserService:
    """Service for user management operations"""
    
    @staticmethod
    def get_all_users():
        """Get all users with order count annotation"""
        return User.objects.annotate(order_count=Count('orders')).order_by('-date_joined')
    
    @staticmethod
    def get_user_by_id(user_id):
        """Get a single user by ID with order count"""
        return get_object_or_404(
            User.objects.annotate(order_count=Count('orders')),
            id=user_id
        )
    
    @staticmethod
    def update_user_status(user, is_active):
        """Update user active status"""
        user.is_active = is_active
        user.save()
        return user
