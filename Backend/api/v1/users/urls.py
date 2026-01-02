from django.urls import path
from .views import (
    UserMeView, UserLoginView, UserRegisterView, UserLogoutView, TokenRefreshView,
    AddressListView, AddressDetailView
)

urlpatterns = [
    path('me/', UserMeView.as_view(), name='user'),
    path('login/', UserLoginView.as_view(), name='login'),
    path('register/', UserRegisterView.as_view(), name='register'),
    path('logout/', UserLogoutView.as_view(), name='logout'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('addresses/', AddressListView.as_view(), name='addresses-list'),
    path('addresses/<int:address_id>/', AddressDetailView.as_view(), name='address-detail'),
]