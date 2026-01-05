from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response

from api.v1.products.serializer.product import ProductSerializer
from api.v1.products.serializer.sku import ProductSKUSerializer
from api.v1.products.services import ProductServices
from apps.products.models import Category
from rest_framework import serializers


class CategorySerializer(serializers.ModelSerializer):
    """Serializer for public category listing"""
    product_count = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'product_count']


class ProductListView(APIView):
    """View for listing products - business logic in ProductServices"""
    authentication_classes = []
    permission_classes = []
    
    def get(self, request):
        # Get query parameters
        featured = request.query_params.get('featured')
        category = request.query_params.get('category')
        
        # Convert featured string to boolean if provided
        featured_bool = None
        if featured is not None:
            featured_bool = featured.lower() == 'true'
        
        # Get products using service
        products = ProductServices.get_products(featured=featured_bool, category=category)
        
        # Serialize products
        serializer = ProductSerializer(products, many=True)
        
        return Response(
            {
                "count": len(serializer.data),
                "data": serializer.data
            },
            status=status.HTTP_200_OK
        )


class ProductDetailView(APIView):
    """View for product detail - business logic in ProductServices"""
    authentication_classes = []
    permission_classes = []
    
    def get(self, request, product_id):
        # Get product using service
        product = ProductServices.get_product(product_id)
        
        # Get SKUs using service
        skus = ProductServices.get_product_skus(product)
        
        # Get recent reviews (limit to 5 for detail page)
        from apps.products.models import ProductReview
        from api.v1.products.serializer.review import ProductReviewSerializer
        recent_reviews = ProductReview.objects.filter(product=product).order_by('-helpful_count', '-created_at')[:5]
        
        # Serialize data
        product_data = ProductSerializer(product).data
        skus_data = ProductSKUSerializer(skus, many=True).data
        reviews_data = ProductReviewSerializer(recent_reviews, many=True).data
        
        return Response({
            "data": {
                "product": product_data,
                "skus": skus_data,
                "recent_reviews": reviews_data
            }
        }, status=status.HTTP_200_OK)


class ProductDetailedSKUView(APIView):
    """View for product SKUs - business logic in ProductServices"""
    authentication_classes = []
    permission_classes = []
    
    def get(self, request, product_id):
        # Get product using service
        product = ProductServices.get_product(product_id)
        
        # Get SKUs using service
        skus = ProductServices.get_product_skus(product)
        
        # Serialize SKUs
        skus_data = ProductSKUSerializer(skus, many=True).data
        
        return Response({
            "count": len(skus_data),
            "data": skus_data
        }, status=status.HTTP_200_OK)


class ProductSearchView(APIView):
    """View for product search - business logic in ProductServices"""
    authentication_classes = []
    permission_classes = []
    
    def get(self, request):
        query = request.query_params.get("q", "").strip()

        if not query:
            return Response(
                {
                    "count": 0,
                    "data": [],
                    "message": "Search query is required"
                },
                status=status.HTTP_200_OK
            )

        # Get search results using service
        products = ProductServices.get_search_results(query)

        # Serialize products
        serializer = ProductSerializer(products, many=True)

        return Response(
            {
                "query": query,
                "count": len(serializer.data),
                "data": serializer.data
            },
            status=status.HTTP_200_OK
        )


class CategoryListView(APIView):
    """View for listing categories - business logic in ProductServices"""
    authentication_classes = []
    permission_classes = []
    
    def get(self, request):
        # Get categories using service
        categories = ProductServices.get_categories()
        
        # Serialize categories
        serializer = CategorySerializer(categories, many=True)
        
        return Response(
            {
                "count": len(serializer.data),
                "data": serializer.data
            },
            status=status.HTTP_200_OK
        )
