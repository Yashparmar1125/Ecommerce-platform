from rest_framework import serializers
from apps.products.models import Product, Category, ProductImage, ProductSKU, ProductAttribute
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


class AdminProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_id = serializers.IntegerField(source='category.id', read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    skus = ProductSKUSerializer(many=True, read_only=True)
    
    class Meta:
        model = Product
        fields = ['id', 'name', 'summary', 'description', 'category', 'category_id', 
                  'category_name', 'cover', 'original_price', 'featured', 'in_stock',
                  'images', 'skus', 'created_at', 'updated_at']
        extra_kwargs = {
            'category': {'required': True}
        }


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
    
    class Meta:
        model = Product
        fields = ['name', 'summary', 'description', 'category', 'cover', 
                  'original_price', 'featured', 'in_stock', 'images', 'skus']
    
    def create(self, validated_data):
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
    
    def update(self, instance, validated_data):
        images_data = validated_data.pop('images', None)
        skus_data = validated_data.pop('skus', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        if images_data is not None:
            # Delete existing images
            instance.images.all().delete()
            # Create new images
            for idx, image_data in enumerate(images_data):
                ProductImage.objects.create(
                    product=instance,
                    image_url=image_data['image_url'],
                    order=image_data.get('order', idx)
                )
        
        if skus_data is not None:
            # Delete existing SKUs
            instance.skus.all().delete()
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
                    product=instance,
                    sku=sku_data['sku'],
                    price=sku_data['price'],
                    quantity=sku_data['quantity'],
                    size_attribute=size_attr,
                    color_attribute=color_attr
                )
        
        return instance


# Order Serializers
class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_id = serializers.IntegerField(source='product.id', read_only=True)
    
    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_id', 'product_name', 'sku', 'quantity', 
                  'price', 'created_at']


class AdminOrderSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_name = serializers.SerializerMethodField()
    items = OrderItemSerializer(many=True, read_only=True)
    address_details = serializers.SerializerMethodField()
    
    class Meta:
        model = Order
        fields = ['id', 'user', 'user_email', 'user_name', 'total', 'status', 
                  'address', 'address_details', 'items', 'created_at', 'updated_at']
    
    def get_user_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}".strip() or obj.user.username
    
    def get_address_details(self, obj):
        if obj.address:
            return {
                'id': obj.address.id,
                'name': obj.address.name,
                'street': obj.address.street,
                'city': obj.address.city,
                'state': obj.address.state,
                'zip_code': obj.address.zip_code,
                'phone': obj.address.phone,
            }
        return None


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
