from rest_framework import serializers
from apps.products.models import Product, ProductImage, ProductSKU, ProductDetail, ProductReview


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['image_url', 'order']


class ProductDetailSerializer(serializers.ModelSerializer):
    """Serializer for product additional details"""
    class Meta:
        model = ProductDetail
        fields = ['material', 'care_instructions', 'fit', 'brand']


class ProductReviewSummarySerializer(serializers.Serializer):
    """Serializer for product review summary"""
    average_rating = serializers.FloatField()
    total_ratings = serializers.IntegerField()
    total_reviews = serializers.IntegerField()
    rating_breakdown = serializers.DictField()


class ProductSerializer(serializers.ModelSerializer):
    category = serializers.StringRelatedField()
    images = serializers.SerializerMethodField()
    sizes = serializers.SerializerMethodField()
    colors = serializers.SerializerMethodField()
    price = serializers.SerializerMethodField()
    details = serializers.SerializerMethodField()
    review_summary = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'summary', 'description', 'category',
            'cover', 'original_price', 'featured', 'in_stock',
            'images', 'sizes', 'colors', 'price', 'details', 
            'review_summary', 'created_at'
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
    
    def get_details(self, obj):
        """Get product additional details if available"""
        try:
            details = obj.details
            return ProductDetailSerializer(details).data
        except ProductDetail.DoesNotExist:
            return None
    
    def get_review_summary(self, obj):
        """Get product review summary"""
        reviews = ProductReview.objects.filter(product=obj)
        total_reviews = reviews.count()
        
        if total_reviews == 0:
            return {
                'average_rating': 0,
                'total_ratings': 0,
                'total_reviews': 0,
                'rating_breakdown': {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
            }
        
        # Calculate average rating
        total_rating = sum(review.rating for review in reviews)
        average_rating = round(total_rating / total_reviews, 1)
        
        # Calculate rating breakdown
        rating_breakdown = {i: 0 for i in range(1, 6)}
        for review in reviews:
            rating_breakdown[review.rating] += 1
        
        return {
            'average_rating': average_rating,
            'total_ratings': total_reviews,
            'total_reviews': total_reviews,
            'rating_breakdown': rating_breakdown
        }
