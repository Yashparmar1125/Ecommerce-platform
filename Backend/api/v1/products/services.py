from django.shortcuts import get_object_or_404
from django.http import Http404
from django.db.models import Q, Prefetch, Count

from apps.products.models import Product, ProductSKU, ProductImage, Category


class ProductServices:
    """Service for product operations - business logic separated from views"""

    @classmethod
    def get_products(cls, featured=None, category=None, include_out_of_stock=False):
        """
        Get all products with optimized queries
        Args:
            featured: Filter by featured status (True/False/None)
            category: Filter by category name (string/None)
            include_out_of_stock: If True, return all products; otherwise hide out-of-stock
        """
        products = Product.objects.select_related("category").prefetch_related(
            Prefetch('images', queryset=ProductImage.objects.order_by('order')),
            Prefetch('skus', queryset=ProductSKU.objects.select_related('size_attribute', 'color_attribute'))
        ).order_by("-created_at")

        if not include_out_of_stock:
            products = products.filter(in_stock=True, skus__quantity__gt=0).distinct()
        
        if featured is not None:
            products = products.filter(featured=featured)
        
        if category:
            products = products.filter(category__name=category)
        
        return products

    @classmethod
    def get_product(cls, product_id, include_out_of_stock=False):
        """Get a single product by ID with all related data"""
        queryset = Product.objects.select_related("category").prefetch_related(
            Prefetch('images', queryset=ProductImage.objects.order_by('order')),
            Prefetch('skus', queryset=ProductSKU.objects.select_related('size_attribute', 'color_attribute'))
        )
        if not include_out_of_stock:
            queryset = queryset.filter(in_stock=True, skus__quantity__gt=0)

        product = queryset.filter(id=product_id).distinct().first()
        if not product:
            raise Http404("Product not found")
        return product

    @classmethod
    def get_product_skus(cls, product, include_out_of_stock=False):
        """Get all SKUs for a product"""
        skus_qs = ProductSKU.objects.filter(product=product).select_related(
            "color_attribute", "size_attribute"
        )
        if not include_out_of_stock:
            skus_qs = skus_qs.filter(quantity__gt=0)
        skus = skus_qs
        return skus
    def get_search_results(cls, query, include_out_of_stock=False):
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
        if not include_out_of_stock:
            products = products.filter(in_stock=True, skus__quantity__gt=0).distinct()
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
