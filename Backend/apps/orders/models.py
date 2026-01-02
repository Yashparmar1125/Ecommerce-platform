from django.db import models
from apps.users.models import User, Address
from apps.products.models import Product,ProductSKU
# Create your models here.

class Order(models.Model):
    PENDING = 'pending'
    PROCESSING = 'processing'
    SHIPPED = 'shipped'
    DELIVERED = 'delivered'
    CANCELLED = 'cancelled'
    
    STATUS_CHOICES = [
        (PENDING, 'Pending'),
        (PROCESSING, 'Processing'),
        (SHIPPED, 'Shipped'),
        (DELIVERED, 'Delivered'),
        (CANCELLED, 'Cancelled'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="orders")
    total = models.DecimalField(max_digits=10, decimal_places=2)
    address = models.ForeignKey(Address, on_delete=models.SET_NULL, null=True, blank=True, related_name="orders", help_text="Shipping address for this order")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=PENDING)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Order #{self.id} - {self.user.username} - {self.status}"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    sku = models.ForeignKey(ProductSKU, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    # Store price at time of order (in case product price changes later)
    price = models.DecimalField(max_digits=10, decimal_places=2, help_text="Price at time of order")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.product.name} x{self.quantity} - Order #{self.order.id}"
