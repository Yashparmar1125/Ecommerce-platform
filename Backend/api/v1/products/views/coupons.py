from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from api.v1.products.serializer.coupon import CouponSerializer, CouponValidateSerializer
from apps.products.models import Coupon
from django.utils import timezone


class CouponListView(APIView):
    """View for listing available coupons"""
    authentication_classes = []
    permission_classes = []
    
    def get(self, request):
        """Get all active and valid coupons"""
        now = timezone.now()
        coupons = Coupon.objects.filter(
            is_active=True,
            valid_from__lte=now,
            valid_until__gte=now
        ).order_by('-discount_value')
        
        serializer = CouponSerializer(coupons, many=True)
        
        return Response({
            "count": len(serializer.data),
            "data": serializer.data
        }, status=status.HTTP_200_OK)


class CouponValidateView(APIView):
    """View for validating and applying coupons"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """Validate coupon code and return discount amount"""
        serializer = CouponValidateSerializer(data=request.data)
        
        if serializer.is_valid():
            coupon = serializer.validated_data['coupon']
            discount = serializer.validated_data['discount']
            
            return Response({
                "data": {
                    "coupon": CouponSerializer(coupon).data,
                    "discount_amount": float(discount),
                    "message": "Coupon applied successfully"
                }
            }, status=status.HTTP_200_OK)
        
        return Response(
            {"error": "Invalid coupon", "detail": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST
        )






