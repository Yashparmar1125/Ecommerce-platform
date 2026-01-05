from django.urls import path

from api.v1.products.views.public import (
    ProductListView, 
    ProductDetailView, 
    ProductDetailedSKUView, 
    ProductSearchView,
    CategoryListView
)
from api.v1.products.views.reviews import (
    ProductReviewListView,
    ProductReviewCreateView,
    ProductReviewHelpfulView
)
from api.v1.products.views.coupons import (
    CouponListView,
    CouponValidateView
)

urlpatterns = [
    path('', ProductListView.as_view(), name='products'),
    path('<int:product_id>/', ProductDetailView.as_view(), name='product-detail'),
    path('<int:product_id>/skus/', ProductDetailedSKUView.as_view(), name='product-skus'),
    path('<int:product_id>/reviews/', ProductReviewListView.as_view(), name='product-reviews'),
    path('<int:product_id>/reviews/create/', ProductReviewCreateView.as_view(), name='product-review-create'),
    path('reviews/<int:review_id>/helpful/', ProductReviewHelpfulView.as_view(), name='review-helpful'),
    path('search/', ProductSearchView.as_view(), name='product-search'),
    path('categories/', CategoryListView.as_view(), name='categories'),
    path('coupons/', CouponListView.as_view(), name='coupons'),
    path('coupons/validate/', CouponValidateView.as_view(), name='coupon-validate'),
]
