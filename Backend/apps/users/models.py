from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    avatar=models.URLField(blank=True,null=True)
    phone_number=models.CharField(max_length=20,blank=True,null=True)
    birth_date=models.DateField(blank=True,null=True)
    created_at=models.DateTimeField(auto_now_add=True)
    updated_at=models.DateTimeField(auto_now=True)



class Address(models.Model):
    user=models.ForeignKey(User,on_delete=models.CASCADE,related_name="addresses")

    # Frontend required fields
    name=models.CharField(max_length=100, help_text="Name for the address (e.g., Home, Office)")
    street=models.CharField(max_length=255, help_text="Street address")
    city=models.CharField(max_length=100)
    state=models.CharField(max_length=100)
    zip_code=models.CharField(max_length=20, help_text="ZIP/Postal code")
    phone=models.CharField(max_length=20, help_text="Phone number for this address")
    is_default=models.BooleanField(default=False, help_text="Whether this is the default address")
    
    # Keep old fields for backward compatibility (optional)
    title=models.CharField(max_length=100, blank=True, null=True)
    address_line_1=models.CharField(max_length=255, blank=True, null=True)
    address_line_2=models.CharField(max_length=255, blank=True, null=True)
    county=models.CharField(max_length=100, blank=True, null=True)
    zipcode=models.CharField(max_length=20, blank=True, null=True)
    landmark=models.CharField(max_length=100, blank=True, null=True)
    phone_number=models.CharField(max_length=20, blank=True, null=True)

    created_at=models.DateTimeField(auto_now_add=True)
    updated_at=models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name_plural = "Addresses"
    
    def __str__(self):
        return f"{self.name} - {self.city}, {self.state}"

