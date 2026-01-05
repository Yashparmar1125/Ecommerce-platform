from django.contrib import admin
from apps.products.models import (
    Category, SubCategory, Product, ProductImage, ProductAttribute, 
    ProductSKU, ProductDetail, ProductReview, Coupon, CouponUsage
)


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'created_at']
    search_fields = ['name']


@admin.register(SubCategory)
class SubCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'parent', 'created_at']
    list_filter = ['parent']
    search_fields = ['name']


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'featured', 'in_stock', 'created_at']
    list_filter = ['category', 'featured', 'in_stock', 'created_at']
    search_fields = ['name', 'description']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    list_display = ['product', 'order', 'created_at']
    list_filter = ['created_at']
    search_fields = ['product__name']


@admin.register(ProductAttribute)
class ProductAttributeAdmin(admin.ModelAdmin):
    list_display = ['type', 'value', 'created_at']
    list_filter = ['type', 'created_at']
    search_fields = ['value']


@admin.register(ProductSKU)
class ProductSKUAdmin(admin.ModelAdmin):
    list_display = ['sku', 'product', 'price', 'quantity', 'created_at']
    list_filter = ['created_at']
    search_fields = ['sku', 'product__name']


@admin.register(ProductDetail)
class ProductDetailAdmin(admin.ModelAdmin):
    list_display = ['product', 'material', 'fit', 'brand']
    search_fields = ['product__name', 'material', 'brand']


@admin.register(ProductReview)
class ProductReviewAdmin(admin.ModelAdmin):
    list_display = ['product', 'user', 'rating', 'is_verified_purchase', 'helpful_count', 'created_at']
    list_filter = ['rating', 'is_verified_purchase', 'created_at']
    search_fields = ['product__name', 'user__username', 'comment']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Coupon)
class CouponAdmin(admin.ModelAdmin):
    list_display = ['code', 'discount_type', 'discount_value', 'is_active', 'valid_from', 'valid_until', 'used_count']
    list_filter = ['discount_type', 'is_active', 'valid_from', 'valid_until']
    search_fields = ['code', 'description']
    readonly_fields = ['used_count', 'created_at', 'updated_at']


@admin.register(CouponUsage)
class CouponUsageAdmin(admin.ModelAdmin):
    list_display = ['coupon', 'user', 'discount_amount', 'used_at']
    list_filter = ['used_at']
    search_fields = ['coupon__code', 'user__username']
    readonly_fields = ['used_at']
