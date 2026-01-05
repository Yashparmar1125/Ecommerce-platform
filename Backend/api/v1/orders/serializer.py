from rest_framework import serializers
from apps.orders.models import Order, OrderItem
from apps.products.models import Product, ProductSKU
from apps.users.models import Address


class SKUSerializer(serializers.ModelSerializer):
    """Nested serializer for SKU details in order items"""
    size = serializers.SerializerMethodField()
    color = serializers.SerializerMethodField()
    
    class Meta:
        model = ProductSKU
        fields = ['id', 'sku', 'size', 'color', 'price']
    
    def get_size(self, obj):
        """Get size attribute value"""
        if obj.size_attribute:
            return obj.size_attribute.value
        return None
    
    def get_color(self, obj):
        """Get color attribute value"""
        if obj.color_attribute:
            return obj.color_attribute.value
        return None


class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_image = serializers.SerializerMethodField()
    sku = SKUSerializer(read_only=True)
    
    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'product_image', 'sku', 'quantity', 'price', 'created_at']
    
    def get_product_image(self, obj):
        """Get the first product image or cover"""
        images = obj.product.images.all().order_by('order')
        if images.exists():
            return images.first().image_url
        return obj.product.cover if obj.product.cover else None


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    address_details = serializers.SerializerMethodField()
    
    class Meta:
        model = Order
        fields = ['id', 'user', 'total', 'address', 'address_details', 'status', 'items', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']
    
    def get_address_details(self, obj):
        """Get address details if address exists"""
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


class OrderItemCreateSerializer(serializers.Serializer):
    """Serializer for creating order items"""
    product_id = serializers.IntegerField()
    sku_id = serializers.IntegerField(required=False, allow_null=True)
    size = serializers.CharField(required=False, allow_blank=True)
    color = serializers.CharField(required=False, allow_blank=True)
    quantity = serializers.IntegerField(min_value=1)
    
    def validate(self, attrs):
        # Either sku_id or size+color must be provided
        if not attrs.get('sku_id') and (not attrs.get('size') or not attrs.get('color')):
            raise serializers.ValidationError("Either sku_id or both size and color must be provided")
        return attrs


class OrderCreateSerializer(serializers.Serializer):
    """Serializer for creating an order"""
    address_id = serializers.IntegerField(required=False, allow_null=True)
    items = OrderItemCreateSerializer(many=True)
    coupon_code = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    
    def validate_coupon_code(self, value):
        """Normalize coupon code - convert to None if empty string"""
        if value and isinstance(value, str):
            value = value.strip()
            if not value:
                return None
            return value.upper()
        return value
    
    def validate_items(self, value):
        if not value or len(value) == 0:
            raise serializers.ValidationError("Order must have at least one item")
        return value

