from rest_framework import serializers
from apps.users.models import User, Address
from rest_framework_simplejwt.tokens import RefreshToken

from django.contrib.auth import authenticate

class UserRegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    first_name = serializers.CharField(required=False)
    last_name = serializers.CharField(required=False)
    phone_number = serializers.CharField(required=False)




class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)




class UserMeSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "phone_number",
        ]

class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField(required=True)


class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = ['id', 'name', 'street', 'city', 'state', 'zip_code', 'phone', 'is_default', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate(self, attrs):
        # If setting as default, unset other default addresses
        if attrs.get('is_default', False):
            user = self.context['request'].user
            Address.objects.filter(user=user, is_default=True).update(is_default=False)
        return attrs


class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'phone_number', 'email']
        extra_kwargs = {
            'email': {'read_only': True}  # Email shouldn't be changed
        }
