from rest_framework import status
from rest_framework.authentication import TokenAuthentication
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated


from api.v1.products.serializer.product import ProductSerializer
from api.v1.products.serializer.sku import ProductSKUSerializer
from api.v1.products.services import ProductServices


class ProductListView(APIView):
    authentication_classes = []
    permission_classes = []
    def get(self, request):
        products = ProductServices.get_products()
        serializer = ProductSerializer(products, many=True)
        return Response(
            {
                "count": len(serializer.data),
                "results": serializer.data
            },
            status=status.HTTP_200_OK
        )


class ProductDetailView(APIView):
    authentication_classes = []
    permission_classes = []
    def get(self, request, product_id):
        product = ProductServices.get_product(product_id)
        skus=ProductServices.get_product_skus(product)
        product_data=ProductSerializer(product).data
        skus_data=ProductSKUSerializer(skus,many=True).data
        return Response({
            "product": product_data,
            "skus": skus_data
        },status=status.HTTP_200_OK)


class ProductDetailedSKUView(APIView):
    authentication_classes = []
    permission_classes = []
    def get(self, request, product_id):
        product = ProductServices.get_product(product_id)
        skus=ProductServices.get_product_skus(product)
        skus_data=ProductSKUSerializer(skus,many=True).data
        return Response({
            "skus": skus_data
        },status=status.HTTP_200_OK)

class ProductSearchView(APIView):
    authentication_classes = []
    permission_classes = []
    def get(self, request):
        query = request.query_params.get("q", "").strip()

        if not query:
            return Response(
                {
                    "count": 0,
                    "results": [],
                    "message": "Search query is required"
                },
                status=status.HTTP_200_OK
            )

        products = ProductServices.get_search_results(query)

        serializer = ProductSerializer(products, many=True)

        return Response(
            {
                "query": query,
                "count": len(serializer.data),
                "results": serializer.data
            },
            status=status.HTTP_200_OK
        )
