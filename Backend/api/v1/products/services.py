from django.shortcuts import get_object_or_404
from django.db.models import Q, Prefetch, Count

from apps.products.models import Product, ProductSKU, ProductImage, Category


class ProductServices:
    """Service for product operations - business logic separated from views"""

    @classmethod
    def get_products(cls, featured=None, category=None):
        """
        Get all products with optimized queries
        Args:
            featured: Filter by featured status (True/False/None)
            category: Filter by category name (string/None)
        """
        products = Product.objects.select_related("category").prefetch_related(
            Prefetch('images', queryset=ProductImage.objects.order_by('order')),
            Prefetch('skus', queryset=ProductSKU.objects.select_related('size_attribute', 'color_attribute'))
        ).order_by("-created_at")
        
        if featured is not None:
            products = products.filter(featured=featured)
        
        if category:
            products = products.filter(category__name=category)
        
        return products

    @classmethod
    def get_product(cls, product_id):
        """Get a single product by ID with all related data"""
        product = get_object_or_404(
            Product.objects.select_related("category").prefetch_related(
                Prefetch('images', queryset=ProductImage.objects.order_by('order')),
                Prefetch('skus', queryset=ProductSKU.objects.select_related('size_attribute', 'color_attribute'))
            ),
            id=product_id
        )
        return product

    @classmethod
    def get_product_skus(cls, product):
        """Get all SKUs for a product"""
        skus = ProductSKU.objects.filter(product=product).select_related(
            "color_attribute", "size_attribute"
        )
        return skus

    @classmethod
    def get_search_results(cls, query):
        """Search products by name or summary"""
        products = (
            Product.objects.filter(
                Q(name__icontains=query) | Q(summary__icontains=query) | Q(description__icontains=query)
            )
            .select_related("category")
            .prefetch_related(
                Prefetch('images', queryset=ProductImage.objects.order_by('order')),
                Prefetch('skus', queryset=ProductSKU.objects.select_related('size_attribute', 'color_attribute'))
            )
            .order_by("-created_at")
        )
        return products

    @classmethod
    def get_featured_products(cls, limit=None):
        """Get featured products"""
        products = cls.get_products(featured=True)
        if limit:
            products = products[:limit]
        return products

    @classmethod
    def get_products_by_category(cls, category_name):
        """Get products filtered by category"""
        return cls.get_products(category=category_name)

    @classmethod
    def get_categories(cls):
        """Get all categories with product count"""
        categories = Category.objects.annotate(
            product_count=Count('product')
        ).filter(product_count__gt=0).order_by('name')
        return categories
