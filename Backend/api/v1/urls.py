from django.urls import path, include

urlpatterns = [
    path("health/", include("api.v1.health.urls")),
    path("users/", include("api.v1.users.urls")),
    path("products/", include("api.v1.products.urls")),
]
