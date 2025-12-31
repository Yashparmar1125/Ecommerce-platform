from django.urls import path
from .views import UserMeView, UserLoginView, UserRegisterView, UserLogoutView

urlpatterns = [
    path('me', UserMeView.as_view(), name='user'),
    path('login', UserLoginView.as_view(), name='login'),
    path('register', UserRegisterView.as_view(), name='register'),
    path('logout', UserLogoutView.as_view(), name='logout'),
]