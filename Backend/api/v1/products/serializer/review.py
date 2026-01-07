from rest_framework import serializers
from apps.products.models import ProductReview
from apps.users.models import User


class ProductReviewSerializer(serializers.ModelSerializer):
    """Serializer for product reviews"""
    user_name = serializers.SerializerMethodField()
    user_email = serializers.SerializerMethodField()
    
    class Meta:
        model = ProductReview
        fields = [
            'id', 'user', 'user_name', 'user_email', 'rating', 'title', 
            'comment', 'is_verified_purchase', 'helpful_count', 
            'created_at', 'updated_at'
        ]
        read_only_fields = ['user', 'helpful_count', 'created_at', 'updated_at']
    
    def get_user_name(self, obj):
        """Get user's full name or username"""
        if obj.user.first_name or obj.user.last_name:
            return f"{obj.user.first_name} {obj.user.last_name}".strip()
        return obj.user.username
    
    def get_user_email(self, obj):
        """Get user's email (masked for privacy)"""
        email = obj.user.email
        if email:
            parts = email.split('@')
            if len(parts) == 2:
                username = parts[0]
                domain = parts[1]
                if len(username) > 2:
                    masked = username[0] + '*' * (len(username) - 2) + username[-1]
                else:
                    masked = '*' * len(username)
                return f"{masked}@{domain}"
        return email


class ProductReviewCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating product reviews"""
    
    class Meta:
        model = ProductReview
        fields = ['product', 'rating', 'title', 'comment']
    
    def validate_rating(self, value):
        """Validate rating is between 1 and 5"""
        if value < 1 or value > 5:
            raise serializers.ValidationError("Rating must be between 1 and 5")
        return value
    
    def create(self, validated_data):
        """Create review with current user"""
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)




