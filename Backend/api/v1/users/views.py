from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError


from .serializer import UserMeSerializer, UserRegisterSerializer, LoginSerializer, LogoutSerializer, AddressSerializer, UserUpdateSerializer
from .services import UserService, AddressService


class UserRegisterView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        serializer = UserRegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = UserService.register_user(serializer.validated_data)
        serializer = UserMeSerializer(user)
        tokens=UserService.generate_tokens(user)

        return Response(
            {
                "data": {
                    "user": serializer.data,
                    "tokens": tokens
                },
                "message": "User registered successfully"
            },
            status=status.HTTP_201_CREATED,
        )




class UserLoginView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = UserService.authenticate_user(
            serializer.validated_data["email"],
            serializer.validated_data["password"],
        )

        tokens = UserService.generate_tokens(user)

        return Response({
            "data": {
                "tokens": tokens
            },
            "message": "Login successful"
        }, status=status.HTTP_200_OK)


class TokenRefreshView(APIView):
    """View for refreshing access tokens"""
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        refresh_token = request.data.get('refresh')
        
        if not refresh_token:
            return Response(
                {
                    'error': 'Refresh token is required',
                    'detail': 'The refresh token field is required in the request body'
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            refresh = RefreshToken(refresh_token)
            access_token = str(refresh.access_token)
            
            # Optionally rotate refresh token
            new_refresh_token = str(refresh)
            
            return Response({
                'data': {
                    'access': access_token,
                    'refresh': new_refresh_token
                }
            }, status=status.HTTP_200_OK)
        except TokenError as e:
            return Response(
                {
                    'error': 'Invalid or expired refresh token',
                    'detail': str(e)
                },
                status=status.HTTP_401_UNAUTHORIZED
            )


class UserMeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        serializer = UserMeSerializer(user)
        return Response({"data": serializer.data}, status=status.HTTP_200_OK)
    
    def patch(self, request):
        """Update user profile"""
        user = request.user
        serializer = UserUpdateSerializer(user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({
            "data": serializer.data,
            "message": "Profile updated successfully"
        }, status=status.HTTP_200_OK)


class UserLogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = LogoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        UserService.logout(serializer.validated_data["refresh"])
        return Response({"message": "Logged out successfully"}, status=status.HTTP_200_OK)


class AddressListView(APIView):
    """View for listing and creating addresses - business logic in AddressService"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get all addresses for the current user"""
        addresses = AddressService.get_user_addresses(request.user)
        serializer = AddressSerializer(addresses, many=True)
        return Response({
            "count": len(serializer.data),
            "data": serializer.data
        }, status=status.HTTP_200_OK)
    
    def post(self, request):
        """Create a new address"""
        serializer = AddressSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        address = AddressService.create_address(request.user, serializer.validated_data)
        serializer = AddressSerializer(address)
        return Response({
            "data": serializer.data,
            "message": "Address created successfully"
        }, status=status.HTTP_201_CREATED)


class AddressDetailView(APIView):
    """View for retrieving, updating, and deleting addresses - business logic in AddressService"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, address_id):
        """Get a specific address"""
        try:
            from apps.users.models import Address
            address = Address.objects.get(id=address_id, user=request.user)
        except Address.DoesNotExist:
            return Response({
                'error': 'Address not found',
                'detail': f'No address found with id {address_id} for the current user'
            }, status=status.HTTP_404_NOT_FOUND)
        
        serializer = AddressSerializer(address)
        return Response({"data": serializer.data}, status=status.HTTP_200_OK)
    
    def patch(self, request, address_id):
        """Update an address"""
        try:
            from apps.users.models import Address
            address = Address.objects.get(id=address_id, user=request.user)
        except Address.DoesNotExist:
            return Response({
                'error': 'Address not found',
                'detail': f'No address found with id {address_id} for the current user'
            }, status=status.HTTP_404_NOT_FOUND)
        
        serializer = AddressSerializer(address, data=request.data, partial=True, context={'request': request})
        serializer.is_valid(raise_exception=True)
        address = AddressService.update_address(address, serializer.validated_data)
        serializer = AddressSerializer(address)
        return Response({
            "data": serializer.data,
            "message": "Address updated successfully"
        }, status=status.HTTP_200_OK)
    
    def delete(self, request, address_id):
        """Delete an address"""
        try:
            from apps.users.models import Address
            address = Address.objects.get(id=address_id, user=request.user)
        except Address.DoesNotExist:
            return Response({
                'error': 'Address not found',
                'detail': f'No address found with id {address_id} for the current user'
            }, status=status.HTTP_404_NOT_FOUND)
        
        AddressService.delete_address(address)
        return Response({'message': 'Address deleted successfully'}, status=status.HTTP_200_OK)
