# apps/users/services.py
from django.contrib.auth import authenticate
from rest_framework.exceptions import AuthenticationFailed, PermissionDenied
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken, OutstandingToken
from apps.users.models import User, Address

class UserService:

    @staticmethod
    def register_user(validated_data):
        email = validated_data["email"]

        user = User(
            username=email,
            email=email,
            first_name=validated_data.get("first_name", ""),
            last_name=validated_data.get("last_name", ""),
            phone_number=validated_data.get("phone_number"),
        )
        user.set_password(validated_data["password"])
        user.save()
        return user

    @staticmethod
    def authenticate_user(email, password):
        user = authenticate(username=email, password=password)
        if not user:
            raise AuthenticationFailed("Invalid email or password")
        if not user.is_active:
            raise PermissionDenied("Account is disabled")
        return user

    @staticmethod
    def generate_tokens(user):
        refresh = RefreshToken.for_user(user)
        return {
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        }

    @staticmethod
    def logout(refresh_token):
        """
        Blacklist the provided refresh token and remove the corresponding outstanding
        token entry so it cannot be reused.
        """
        token = RefreshToken(refresh_token)

        # Blacklist the refresh token (creates BlacklistedToken entry)
        token.blacklist()

        # Remove the specific outstanding token to prevent reuse
        jti = token["jti"]
        try:
            outstanding = OutstandingToken.objects.get(jti=jti)
            BlacklistedToken.objects.filter(token=outstanding).delete()
            outstanding.delete()
        except OutstandingToken.DoesNotExist:
            # If it's already gone, nothing else to do
            pass


class AddressService:
    """Service for address operations - business logic separated from views"""
    
    @staticmethod
    def get_user_addresses(user):
        """Get all addresses for a user"""
        return Address.objects.filter(user=user).order_by('-is_default', '-created_at')
    
    @staticmethod
    def create_address(user, validated_data):
        """Create a new address for a user"""
        # If setting as default, unset other default addresses
        if validated_data.get('is_default', False):
            Address.objects.filter(user=user, is_default=True).update(is_default=False)
        
        address = Address.objects.create(user=user, **validated_data)
        return address
    
    @staticmethod
    def update_address(address, validated_data):
        """Update an existing address"""
        # If setting as default, unset other default addresses
        if validated_data.get('is_default', False):
            Address.objects.filter(user=address.user, is_default=True).exclude(id=address.id).update(is_default=False)
        
        for key, value in validated_data.items():
            setattr(address, key, value)
        address.save()
        return address
    
    @staticmethod
    def delete_address(address):
        """Delete an address"""
        address.delete()
