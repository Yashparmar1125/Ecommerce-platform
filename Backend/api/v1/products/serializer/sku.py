from rest_framework import serializers
from apps.products.models import ProductSKU


class ProductSKUSerializer(serializers.ModelSerializer):
    color = serializers.CharField(source="color_attribute.value")
    size = serializers.CharField(source="size_attribute.value")

    class Meta:
        model = ProductSKU
        fields = [
            "id",
            "sku",
            "color",
            "size",
            "price",
            "quantity",
        ]