from django.db import models
from django.contrib.auth import get_user_model
import json

User = get_user_model()

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


class ProductDetail(models.Model):
    """Additional product details like material, care instructions, fit"""
    product = models.OneToOneField(Product, on_delete=models.CASCADE, related_name="details")
    material = models.CharField(max_length=255, blank=True, help_text="Product material composition")
    care_instructions = models.TextField(blank=True, help_text="Care and washing instructions")
    fit = models.CharField(max_length=100, blank=True, help_text="Fit type (e.g., Regular Fit, Slim Fit)")
    brand = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Details for {self.product.name}"


class ProductReview(models.Model):
    """Product reviews and ratings"""
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="reviews")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="product_reviews")
    rating = models.PositiveIntegerField(choices=[(i, i) for i in range(1, 6)], help_text="Rating from 1 to 5")
    title = models.CharField(max_length=200, blank=True)
    comment = models.TextField(help_text="Review comment")
    is_verified_purchase = models.BooleanField(default=False, help_text="Whether user purchased this product")
    helpful_count = models.PositiveIntegerField(default=0, help_text="Number of users who found this helpful")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-helpful_count', '-created_at']
        unique_together = ['product', 'user']  # One review per user per product

    def __str__(self):
        return f"{self.user.username} - {self.product.name} - {self.rating} stars"


class Coupon(models.Model):
    """Discount coupons/codes"""
    code = models.CharField(max_length=50, unique=True, help_text="Coupon code")
    description = models.CharField(max_length=255, blank=True)
    discount_type = models.CharField(
        max_length=20,
        choices=[
            ('percentage', 'Percentage'),
            ('fixed', 'Fixed Amount'),
        ],
        default='percentage'
    )
    discount_value = models.DecimalField(max_digits=10, decimal_places=2, help_text="Discount percentage or fixed amount")
    min_purchase_amount = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        default=0, 
        help_text="Minimum purchase amount to use this coupon"
    )
    max_discount_amount = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        null=True, 
        blank=True, 
        help_text="Maximum discount amount (for percentage coupons)"
    )
    is_active = models.BooleanField(default=True)
    valid_from = models.DateTimeField(help_text="Coupon valid from date")
    valid_until = models.DateTimeField(help_text="Coupon expiry date")
    usage_limit = models.PositiveIntegerField(
        null=True, 
        blank=True, 
        help_text="Maximum number of times coupon can be used (null = unlimited)"
    )
    used_count = models.PositiveIntegerField(default=0, help_text="Number of times coupon has been used")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.code} - {self.discount_value}% off"

    def is_valid(self):
        """Check if coupon is currently valid"""
        from django.utils import timezone
        now = timezone.now()
        return (
            self.is_active and
            self.valid_from <= now <= self.valid_until and
            (self.usage_limit is None or self.used_count < self.usage_limit)
        )

    def calculate_discount(self, amount):
        """Calculate discount amount for given purchase amount"""
        from decimal import Decimal
        
        # Convert amount to Decimal for precise calculations
        amount = Decimal(str(amount))
        
        # Check validity and minimum purchase
        from django.utils import timezone
        now = timezone.now()
        if not (
            self.is_active and
            self.valid_from <= now <= self.valid_until and
            (self.usage_limit is None or self.used_count < self.usage_limit) and
            amount >= self.min_purchase_amount
        ):
            return Decimal('0.00')
        
        if self.discount_type == 'percentage':
            discount = (amount * self.discount_value) / 100
            if self.max_discount_amount:
                discount = min(discount, Decimal(str(self.max_discount_amount)))
        else:  # fixed
            discount = min(Decimal(str(self.discount_value)), amount)
        
        # Ensure discount doesn't exceed the total amount
        return min(discount, amount)


class CouponUsage(models.Model):
    """Track coupon usage by users"""
    coupon = models.ForeignKey(Coupon, on_delete=models.CASCADE, related_name="usages")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="coupon_usages")
    order = models.ForeignKey('orders.Order', on_delete=models.CASCADE, related_name="coupon_usage", null=True, blank=True)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2)
    used_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['coupon', 'user', 'order']  # Prevent duplicate usage per order

    def __str__(self):
        return f"{self.user.username} used {self.coupon.code}"
