from rest_framework import serializers
from apps.products.models import Product, ProductImage, ProductSKU


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['image_url', 'order']


class ProductSerializer(serializers.ModelSerializer):
    category = serializers.StringRelatedField()
    images = serializers.SerializerMethodField()
    sizes = serializers.SerializerMethodField()
    colors = serializers.SerializerMethodField()
    price = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'summary', 'description', 'category',
            'cover', 'original_price', 'featured', 'in_stock',
            'images', 'sizes', 'colors', 'price', 'created_at'
        ]
    
    def get_images(self, obj):
        """Get all product images ordered by order field"""
        images = obj.images.all().order_by('order')
        return [img.image_url for img in images] if images.exists() else ([obj.cover] if obj.cover else [])
    
    def get_sizes(self, obj):
        """Get unique sizes from product SKUs"""
        sizes = ProductSKU.objects.filter(
            product=obj,
            size_attribute__isnull=False
        ).select_related('size_attribute').values_list(
            'size_attribute__value', flat=True
        ).distinct()
        return list(sizes)
    
    def get_colors(self, obj):
        """Get unique colors from product SKUs"""
        colors = ProductSKU.objects.filter(
            product=obj,
            color_attribute__isnull=False
        ).select_related('color_attribute').values_list(
            'color_attribute__value', flat=True
        ).distinct()
        return list(colors)
    
    def get_price(self, obj):
        """Get minimum price from product SKUs"""
        sku = ProductSKU.objects.filter(product=obj).order_by('price').first()
        return float(sku.price) if sku else (float(obj.original_price) if obj.original_price else 0.0)
