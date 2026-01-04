from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

from .serializers import (
    AdminLoginSerializer,
    AdminProductSerializer, AdminProductCreateUpdateSerializer,
    AdminOrderSerializer, OrderStatusUpdateSerializer,
    AdminUserSerializer, CategorySerializer,
    DashboardStatsSerializer, ProductAttributeSerializer
)
from .permissions import IsAdminUser
from .services import (
    AdminAuthService,
    AdminDashboardService,
    AdminProductService,
    AdminCategoryService,
    AdminOrderService,
    AdminUserService
)
from apps.products.models import ProductAttribute


# ==================== ADMIN AUTHENTICATION ====================

class AdminLoginView(APIView):
    """Admin login endpoint - separate from regular user login"""
    permission_classes = [AllowAny]
    authentication_classes = []
    
    def post(self, request):
        serializer = AdminLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        username = serializer.validated_data['username']
        password = serializer.validated_data['password']
        
        # Authenticate and verify superuser status
        user = AdminAuthService.authenticate_admin(username, password)
        
        # Generate tokens
        tokens = AdminAuthService.generate_admin_tokens(user)
        
        return Response({
            "data": {
                "tokens": tokens
            },
            "message": "Admin login successful"
        }, status=status.HTTP_200_OK)


class AdminDashboardView(APIView):
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        stats = AdminDashboardService.get_dashboard_stats()
        serializer = DashboardStatsSerializer(stats)
        return Response({"data": serializer.data}, status=status.HTTP_200_OK)


# ==================== PRODUCT ATTRIBUTES ====================

class AdminProductAttributesView(APIView):
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        attr_type = request.query_params.get('type')  # 'size' or 'color'
        attributes = ProductAttribute.objects.filter(deleted_at__isnull=True)
        
        if attr_type:
            attributes = attributes.filter(type=attr_type)
        
        serializer = ProductAttributeSerializer(attributes, many=True)
        return Response({
            'count': len(serializer.data),
            'data': serializer.data
        }, status=status.HTTP_200_OK)


# ==================== PRODUCT MANAGEMENT ====================

class AdminProductListView(APIView):
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        products = AdminProductService.get_all_products()
        serializer = AdminProductSerializer(products, many=True)
        return Response({
            'count': len(serializer.data),
            'data': serializer.data
        }, status=status.HTTP_200_OK)
    
    def post(self, request):
        serializer = AdminProductCreateUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        product = serializer.save()
        response_serializer = AdminProductSerializer(product)
        return Response({
            "data": response_serializer.data,
            "message": "Product created successfully"
        }, status=status.HTTP_201_CREATED)


class AdminProductDetailView(APIView):
    permission_classes = [IsAdminUser]
    
    def get(self, request, product_id):
        product = AdminProductService.get_product_by_id(product_id)
        serializer = AdminProductSerializer(product)
        return Response({"data": serializer.data}, status=status.HTTP_200_OK)
    
    def put(self, request, product_id):
        product = AdminProductService.get_product_by_id(product_id)
        serializer = AdminProductCreateUpdateSerializer(product, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        
        product = serializer.save()
        response_serializer = AdminProductSerializer(product)
        return Response({
            "data": response_serializer.data,
            "message": "Product updated successfully"
        }, status=status.HTTP_200_OK)
    
    def delete(self, request, product_id):
        AdminProductService.delete_product(product_id)
        return Response({'message': 'Product deleted successfully'}, status=status.HTTP_200_OK)


# ==================== CATEGORY MANAGEMENT ====================

class AdminCategoryListView(APIView):
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        categories = AdminCategoryService.get_all_categories()
        serializer = CategorySerializer(categories, many=True)
        return Response({
            'count': len(serializer.data),
            'data': serializer.data
        }, status=status.HTTP_200_OK)
    
    def post(self, request):
        serializer = CategorySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        category = AdminCategoryService.create_category(serializer.validated_data)
        return Response({
            "data": CategorySerializer(category).data,
            "message": "Category created successfully"
        }, status=status.HTTP_201_CREATED)


class AdminCategoryDetailView(APIView):
    permission_classes = [IsAdminUser]
    
    def get(self, request, category_id):
        category = AdminCategoryService.get_category_by_id(category_id)
        serializer = CategorySerializer(category)
        return Response({"data": serializer.data}, status=status.HTTP_200_OK)
    
    def put(self, request, category_id):
        category = AdminCategoryService.get_category_by_id(category_id)
        serializer = CategorySerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        
        category = AdminCategoryService.update_category(category, serializer.validated_data)
        return Response({
            "data": CategorySerializer(category).data,
            "message": "Category updated successfully"
        }, status=status.HTTP_200_OK)
    
    def delete(self, request, category_id):
        AdminCategoryService.delete_category(category_id)
        return Response({'message': 'Category deleted successfully'}, status=status.HTTP_200_OK)


# ==================== ORDER MANAGEMENT ====================

class AdminOrderListView(APIView):
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        status_filter = request.query_params.get('status')
        orders = AdminOrderService.get_all_orders(status_filter=status_filter)
        
        serializer = AdminOrderSerializer(orders, many=True)
        return Response({
            'count': len(serializer.data),
            'data': serializer.data
        }, status=status.HTTP_200_OK)


class AdminOrderDetailView(APIView):
    permission_classes = [IsAdminUser]
    
    def get(self, request, order_id):
        order = AdminOrderService.get_order_by_id(order_id)
        serializer = AdminOrderSerializer(order)
        return Response({"data": serializer.data}, status=status.HTTP_200_OK)
    
    def patch(self, request, order_id):
        order = AdminOrderService.get_order_by_id(order_id)
        serializer = OrderStatusUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        order = AdminOrderService.update_order_status(order, serializer.validated_data['status'])
        response_serializer = AdminOrderSerializer(order)
        return Response({
            "data": response_serializer.data,
            "message": "Order status updated successfully"
        }, status=status.HTTP_200_OK)


# ==================== USER MANAGEMENT ====================

class AdminUserListView(APIView):
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        users = AdminUserService.get_all_users()
        serializer = AdminUserSerializer(users, many=True)
        return Response({
            'count': len(serializer.data),
            'data': serializer.data
        }, status=status.HTTP_200_OK)


class AdminUserDetailView(APIView):
    permission_classes = [IsAdminUser]
    
    def get(self, request, user_id):
        user = AdminUserService.get_user_by_id(user_id)
        serializer = AdminUserSerializer(user)
        return Response({"data": serializer.data}, status=status.HTTP_200_OK)
    
    def patch(self, request, user_id):
        user = AdminUserService.get_user_by_id(user_id)
        
        # Allow updating is_active status
        if 'is_active' in request.data:
            user = AdminUserService.update_user_status(user, request.data['is_active'])
        
        serializer = AdminUserSerializer(user)
        return Response({
            "data": serializer.data,
            "message": "User status updated successfully"
        }, status=status.HTTP_200_OK)
