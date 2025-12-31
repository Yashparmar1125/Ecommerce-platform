from django.shortcuts import get_object_or_404
from django.db.models import Q

from apps.products.models import Product, ProductSKU


class ProductServices:

    @classmethod
    def get_products(cls):
        products = Product.objects.select_related("category").order_by("-created_at")
        return products

    @classmethod
    def get_product(cls, product_id):
        product = get_object_or_404(Product.objects.select_related("category"),id=product_id)
        return product

    @classmethod
    def get_product_skus(cls, product):
        skus=ProductSKU.objects.filter(product=product).select_related("color_attribute", "size_attribute")
        return skus

    @classmethod
    def get_search_results(cls, query):
        products = (
            Product.objects.filter().filter(Q(name__icontains=query) | Q(summary__icontains=query)).select_related("category").order_by("-created_at")
        )
        return products