from django.urls import path

from api.v1.products.views.public import ProductListView, ProductDetailView, ProductDetailedSKUView, ProductSearchView

urlpatterns = [
    path('', ProductListView.as_view(), name='products'),
    path('<int:product_id>/', ProductDetailView.as_view(), name='product-detail'),
    path('<int:product_id>/skus/', ProductDetailedSKUView.as_view(), name='product-skus'),
    path('search/', ProductSearchView.as_view(), name='product-search'),
]