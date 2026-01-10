from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import NotFound, ValidationError

from api.v1.products.serializer.review import ProductReviewSerializer, ProductReviewCreateSerializer
from apps.products.models import Product, ProductReview
from apps.orders.models import Order, OrderItem


class ProductReviewListView(APIView):
    """View for listing product reviews"""
    authentication_classes = []
    permission_classes = []
    
    def get(self, request, product_id):
        """Get all reviews for a product"""
        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response(
                {"error": "Product not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        reviews = ProductReview.objects.filter(product=product).order_by('-helpful_count', '-created_at')
        serializer = ProductReviewSerializer(reviews, many=True)
        
        return Response({
            "count": len(serializer.data),
            "data": serializer.data
        }, status=status.HTTP_200_OK)


class ProductReviewCreateView(APIView):
    """View for creating product reviews"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request, product_id):
        """Create a new review for a product"""
        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response(
                {"error": "Product not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if user already reviewed this product
        existing_review = ProductReview.objects.filter(
            product=product,
            user=request.user
        ).first()
        
        if existing_review:
            return Response(
                {"error": "You have already reviewed this product"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if user has purchased this product (for verified purchase badge)
        has_purchased = OrderItem.objects.filter(
            order__user=request.user,
            product=product,
            order__status__in=['delivered', 'shipped', 'processing']
        ).exists()
        
        serializer = ProductReviewCreateSerializer(
            data=request.data,
            context={'request': request}
        )
        
        if serializer.is_valid():
            review = serializer.save()
            review.is_verified_purchase = has_purchased
            review.save()
            
            return Response({
                "data": ProductReviewSerializer(review).data,
                "message": "Review created successfully"
            }, status=status.HTTP_201_CREATED)
        
        return Response(
            {"error": "Invalid data", "detail": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST
        )


class ProductReviewHelpfulView(APIView):
    """View for marking a review as helpful"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request, review_id):
        """Increment helpful count for a review"""
        try:
            review = ProductReview.objects.get(id=review_id)
        except ProductReview.DoesNotExist:
            return Response(
                {"error": "Review not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        review.helpful_count += 1
        review.save()
        
        return Response({
            "data": ProductReviewSerializer(review).data,
            "message": "Review marked as helpful"
        }, status=status.HTTP_200_OK)







