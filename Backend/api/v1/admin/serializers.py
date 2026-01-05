from rest_framework import serializers
from apps.products.models import Product, Category, ProductImage, ProductSKU, ProductAttribute, ProductDetail, ProductReview, Coupon, CouponUsage
from apps.orders.models import Order, OrderItem
from apps.users.models import User, Address
from apps.cart.models import Cart, CartItem


# Admin Authentication Serializers
class AdminLoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=True)
    password = serializers.CharField(write_only=True, required=True)


# Category Serializers
class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'


# Product Serializers
class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image_url', 'order']
        extra_kwargs = {
            'product': {'read_only': True}
        }


class ProductAttributeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductAttribute
        fields = '__all__'


class ProductSKUSerializer(serializers.ModelSerializer):
    size_value = serializers.CharField(source='size_attribute.value', read_only=True)
    color_value = serializers.CharField(source='color_attribute.value', read_only=True)
    
    class Meta:
        model = ProductSKU
        fields = ['id', 'sku', 'price', 'quantity', 'size_attribute', 'color_attribute', 
                  'size_value', 'color_value', 'created_at']


class ProductDetailSerializer(serializers.ModelSerializer):
    """Serializer for product additional details"""
    class Meta:
        model = ProductDetail
        fields = ['id', 'material', 'care_instructions', 'fit', 'brand', 'created_at', 'updated_at']


class AdminProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_id = serializers.IntegerField(source='category.id', read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    skus = ProductSKUSerializer(many=True, read_only=True)
    details = ProductDetailSerializer(read_only=True)
    
    class Meta:
        model = Product
        fields = ['id', 'name', 'summary', 'description', 'category', 'category_id', 
                  'category_name', 'cover', 'original_price', 'featured', 'in_stock',
                  'images', 'skus', 'details', 'created_at', 'updated_at']
        extra_kwargs = {
            'category': {'required': True}
        }


class ProductDetailCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating product details"""
    class Meta:
        model = ProductDetail
        fields = ['material', 'care_instructions', 'fit', 'brand']


class SKUCreateSerializer(serializers.Serializer):
    """Serializer for creating SKUs"""
    sku = serializers.CharField(max_length=100, required=True)
    price = serializers.DecimalField(max_digits=10, decimal_places=2, required=True)
    quantity = serializers.IntegerField(min_value=0, required=True)
    size_attribute_id = serializers.IntegerField(required=False, allow_null=True)
    color_attribute_id = serializers.IntegerField(required=False, allow_null=True)


class AdminProductCreateUpdateSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, required=False)
    skus = SKUCreateSerializer(many=True, required=False)
    details = ProductDetailCreateUpdateSerializer(required=False)
    
    class Meta:
        model = Product
        fields = ['name', 'summary', 'description', 'category', 'cover', 
                  'original_price', 'featured', 'in_stock', 'images', 'skus', 'details']
    
    def create(self, validated_data):
        images_data = validated_data.pop('images', [])
        skus_data = validated_data.pop('skus', [])
        details_data = validated_data.pop('details', None)
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
                    size_attr = ProductAttribute.objects.get(id=sku_data['size_attribute_id'], type='size')
                except ProductAttribute.DoesNotExist:
                    pass
            
            if sku_data.get('color_attribute_id'):
                try:
                    color_attr = ProductAttribute.objects.get(id=sku_data['color_attribute_id'], type='color')
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
        
        # Create product details if provided
        if details_data:
            ProductDetail.objects.create(product=product, **details_data)
        
        return product
    
    def update(self, instance, validated_data):
        images_data = validated_data.pop('images', None)
        skus_data = validated_data.pop('skus', None)
        details_data = validated_data.pop('details', None)
        
        # Update product fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update images if provided
        if images_data is not None:
            ProductImage.objects.filter(product=instance).delete()
            for idx, image_data in enumerate(images_data):
                ProductImage.objects.create(
                    product=instance,
                    image_url=image_data['image_url'],
                    order=image_data.get('order', idx)
                )
        
        # Update SKUs if provided
        if skus_data is not None:
            ProductSKU.objects.filter(product=instance).delete()
            for sku_data in skus_data:
                size_attr = None
                color_attr = None
                
                if sku_data.get('size_attribute_id'):
                    try:
                        size_attr = ProductAttribute.objects.get(id=sku_data['size_attribute_id'], type='size')
                    except ProductAttribute.DoesNotExist:
                        pass
                
                if sku_data.get('color_attribute_id'):
                    try:
                        color_attr = ProductAttribute.objects.get(id=sku_data['color_attribute_id'], type='color')
                    except ProductAttribute.DoesNotExist:
                        pass
                
                ProductSKU.objects.create(
                    product=instance,
                    sku=sku_data['sku'],
                    price=sku_data['price'],
                    quantity=sku_data['quantity'],
                    size_attribute=size_attr,
                    color_attribute=color_attr
                )
        
        # Update product details if provided
        if details_data:
            ProductDetail.objects.update_or_create(
                product=instance,
                defaults=details_data
            )
        
        return instance


# Review Serializers
class AdminProductReviewSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    user_name = serializers.SerializerMethodField()
    user_email = serializers.EmailField(source='user.email', read_only=True)
    
    class Meta:
        model = ProductReview
        fields = ['id', 'product', 'product_name', 'user', 'user_name', 'user_email',
                  'rating', 'title', 'comment', 'is_verified_purchase', 'helpful_count',
                  'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']
    
    def get_user_name(self, obj):
        if obj.user.first_name or obj.user.last_name:
            return f"{obj.user.first_name} {obj.user.last_name}".strip()
        return obj.user.username


# Coupon Serializers
class AdminCouponSerializer(serializers.ModelSerializer):
    is_valid = serializers.SerializerMethodField()
    
    class Meta:
        model = Coupon
        fields = '__all__'
    
    def get_is_valid(self, obj):
        """Check if coupon is currently valid"""
        try:
            from django.utils import timezone
            now = timezone.now()
            return (
                obj.is_active and
                obj.valid_from <= now <= obj.valid_until and
                (obj.usage_limit is None or obj.used_count < obj.usage_limit)
            )
        except:
            return False


class AdminCouponUsageSerializer(serializers.ModelSerializer):
    coupon_code = serializers.CharField(source='coupon.code', read_only=True)
    user_name = serializers.SerializerMethodField()
    user_email = serializers.EmailField(source='user.email', read_only=True)
    
    class Meta:
        model = CouponUsage
        fields = ['id', 'coupon', 'coupon_code', 'user', 'user_name', 'user_email',
                  'order', 'discount_amount', 'used_at']
        read_only_fields = ['used_at']
    
    def get_user_name(self, obj):
        if obj.user.first_name or obj.user.last_name:
            return f"{obj.user.first_name} {obj.user.last_name}".strip()
        return obj.user.username


# Order Serializers
class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    
    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'quantity', 'price', 'created_at']


class AdminOrderSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_name = serializers.SerializerMethodField()
    items = OrderItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = Order
        fields = ['id', 'user', 'user_email', 'user_name', 'total', 'status', 
                  'items', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']
    
    def get_user_name(self, obj):
        if obj.user.first_name or obj.user.last_name:
            return f"{obj.user.first_name} {obj.user.last_name}".strip()
        return obj.user.username


class OrderStatusUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=Order.STATUS_CHOICES)


# User Serializers
class AdminUserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    order_count = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'full_name',
                  'phone_number', 'is_active', 'is_staff', 'is_superuser', 
                  'date_joined', 'order_count']
        read_only_fields = ['date_joined', 'order_count']
    
    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip() or obj.username
    
    def get_order_count(self, obj):
        return obj.orders.count()


# Address Serializer
class AdminAddressSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    
    class Meta:
        model = Address
        fields = ['id', 'user', 'user_email', 'name', 'street', 'city', 'state',
                  'zip_code', 'phone', 'is_default', 'created_at', 'updated_at']


# Dashboard Stats Serializer
class DashboardStatsSerializer(serializers.Serializer):
    total_users = serializers.IntegerField()
    total_products = serializers.IntegerField()
    total_orders = serializers.IntegerField()
    total_revenue = serializers.DecimalField(max_digits=10, decimal_places=2)
    pending_orders = serializers.IntegerField()
    recent_orders = AdminOrderSerializer(many=True)
