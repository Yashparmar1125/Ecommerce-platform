from django.contrib import admin
from .models import ProductSKU, Product, ProductAttribute, Category, SubCategory
# Register your models here.

admin.site.register(ProductSKU)
admin.site.register(Product)
admin.site.register(ProductAttribute)
admin.site.register(Category)
admin.site.register(SubCategory)