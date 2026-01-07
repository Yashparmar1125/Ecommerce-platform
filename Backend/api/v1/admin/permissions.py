from rest_framework import permissions


class IsAdminUser(permissions.BasePermission):
    """
    Permission class to check if user is a superuser/admin
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_superuser





