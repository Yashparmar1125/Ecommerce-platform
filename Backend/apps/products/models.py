from django.db import models
import json

class Category(models.Model):
    name = models.CharField(max_length=150)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    def __str__(self):
        return self.name

class SubCategory(models.Model):
    parent = models.ForeignKey(Category, on_delete=models.CASCADE, related_name="categories")
    name = models.CharField(max_length=150)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    def __str__(self):
        return self.name

class Product(models.Model):
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True)
    name = models.CharField(max_length=255)
    summary = models.CharField(max_length=500)
    description = models.TextField()
    cover=models.URLField(blank=True)
    # Frontend required fields
    original_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, help_text="Original price before discount")
    featured = models.BooleanField(default=False, help_text="Whether product is featured")
    in_stock = models.BooleanField(default=True, help_text="Product availability status")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    def __str__(self):
        return self.name


class ProductImage(models.Model):
    """Model to store multiple images for a product"""
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="images")
    image_url = models.URLField()
    order = models.PositiveIntegerField(default=0, help_text="Order of image display")
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['order', 'created_at']
    
    def __str__(self):
        return f"{self.product.name} - Image {self.order}"


class ProductAttribute(models.Model):
    COLOR = "color"
    SIZE = "size"

    ATTRIBUTE_TYPE_CHOICES = [
        (COLOR, "Color"),
        (SIZE, "Size"),
    ]

    type = models.CharField(max_length=20, choices=ATTRIBUTE_TYPE_CHOICES)
    value = models.CharField(max_length=100)

    created_at = models.DateTimeField(auto_now_add=True)
    deleted_at = models.DateTimeField(blank=True, null=True)


class ProductSKU(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="skus")
    size_attribute = models.ForeignKey(
        ProductAttribute, on_delete=models.SET_NULL, null=True, related_name="size_skus"
    )
    color_attribute = models.ForeignKey(
        ProductAttribute, on_delete=models.SET_NULL, null=True, related_name="color_skus"
    )

    sku = models.CharField(max_length=100, unique=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField()

    created_at = models.DateTimeField(auto_now_add=True)
    deleted_at = models.DateTimeField(blank=True, null=True)
