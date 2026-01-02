from django.urls import path
from .views import (
    AdminLoginView,
    AdminDashboardView,
    AdminProductAttributesView,
    AdminProductListView, AdminProductDetailView,
    AdminCategoryListView, AdminCategoryDetailView,
    AdminOrderListView, AdminOrderDetailView,
    AdminUserListView, AdminUserDetailView,
)

urlpatterns = [
    # Authentication
    path('login', AdminLoginView.as_view(), name='admin-login'),
    
    # Dashboard
    path('dashboard', AdminDashboardView.as_view(), name='admin-dashboard'),
    
    # Product Attributes
    path('attributes', AdminProductAttributesView.as_view(), name='admin-attributes'),
    
    # Products
    path('products', AdminProductListView.as_view(), name='admin-products-list'),
    path('products/<int:product_id>', AdminProductDetailView.as_view(), name='admin-product-detail'),
    
    # Categories
    path('categories', AdminCategoryListView.as_view(), name='admin-categories-list'),
    path('categories/<int:category_id>', AdminCategoryDetailView.as_view(), name='admin-category-detail'),
    
    # Orders
    path('orders', AdminOrderListView.as_view(), name='admin-orders-list'),
    path('orders/<int:order_id>', AdminOrderDetailView.as_view(), name='admin-order-detail'),
    
    # Users
    path('users', AdminUserListView.as_view(), name='admin-users-list'),
    path('users/<int:user_id>', AdminUserDetailView.as_view(), name='admin-user-detail'),
]

