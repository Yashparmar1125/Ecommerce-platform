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

    title=models.CharField(max_length=100)
    address_line_1=models.CharField(max_length=255)
    address_line_2=models.CharField(max_length=255)
    county=models.CharField(max_length=100)
    state=models.CharField(max_length=100)
    city=models.CharField(max_length=100)
    zipcode=models.CharField(max_length=20)
    landmark=models.CharField(max_length=100)
    phone_number=models.CharField(max_length=20)

    created_at=models.DateTimeField(auto_now_add=True)
    updated_at=models.DateTimeField(auto_now=True)

