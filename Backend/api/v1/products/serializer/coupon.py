from rest_framework import serializers
from apps.products.models import Coupon
from decimal import Decimal


class CouponSerializer(serializers.ModelSerializer):
    """Serializer for coupon listing"""
    is_valid = serializers.SerializerMethodField()
    
    class Meta:
        model = Coupon
        fields = [
            'id', 'code', 'description', 'discount_type', 'discount_value',
            'min_purchase_amount', 'max_discount_amount', 'is_active',
            'valid_from', 'valid_until', 'usage_limit', 'used_count', 'is_valid'
        ]
    
    def get_is_valid(self, obj):
        """Check if coupon is currently valid"""
        try:
            return obj.is_valid()
        except:
            # If is_valid() requires parameters, return basic validation
            from django.utils import timezone
            now = timezone.now()
            return (
                obj.is_active and
                obj.valid_from <= now <= obj.valid_until and
                (obj.usage_limit is None or obj.used_count < obj.usage_limit)
            )


class CouponValidateSerializer(serializers.Serializer):
    """Serializer for validating and applying coupons"""
    code = serializers.CharField(max_length=50)
    amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    
    def validate(self, attrs):
        """Validate coupon code and calculate discount"""
        code = attrs.get('code')
        amount = attrs.get('amount')
        
        try:
            # Use select_for_update to lock coupon during validation (if in transaction)
            coupon = Coupon.objects.select_for_update(skip_locked=True).get(code=code.upper())
        except Coupon.DoesNotExist:
            raise serializers.ValidationError({"code": "Invalid coupon code"})
        
        # Check if coupon is valid
        from django.utils import timezone
        now = timezone.now()
        
        if not coupon.is_active:
            raise serializers.ValidationError({"code": "This coupon is not active"})
        
        if coupon.valid_from > now:
            raise serializers.ValidationError({"code": "This coupon is not yet active"})
        
        if coupon.valid_until < now:
            raise serializers.ValidationError({"code": "This coupon has expired"})
        
        # Check usage limit - refresh from DB to get latest count
        coupon.refresh_from_db()
        if coupon.usage_limit is not None and coupon.used_count >= coupon.usage_limit:
            raise serializers.ValidationError({"code": "This coupon has reached its usage limit"})
        
        if amount < coupon.min_purchase_amount:
            raise serializers.ValidationError({
                "code": f"Minimum purchase amount of ₹{coupon.min_purchase_amount} required"
            })
        
        discount = coupon.calculate_discount(amount)
        
        attrs['coupon'] = coupon
        attrs['discount'] = discount
        return attrs

