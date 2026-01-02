from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .serializer import OrderSerializer, OrderCreateSerializer
from .services import OrderService


class OrderListView(APIView):
    """View for listing and creating orders - business logic in OrderService"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get all orders for the current user"""
        orders = OrderService.get_user_orders(request.user)
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def post(self, request):
        """Create a new order"""
        serializer = OrderCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            order = OrderService.create_order(request.user, serializer.validated_data)
            serializer = OrderSerializer(order)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class OrderDetailView(APIView):
    """View for retrieving a specific order - business logic in OrderService"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, order_id):
        """Get a specific order"""
        order = OrderService.get_order(request.user, order_id)
        if not order:
            return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = OrderSerializer(order)
        return Response(serializer.data, status=status.HTTP_200_OK)

