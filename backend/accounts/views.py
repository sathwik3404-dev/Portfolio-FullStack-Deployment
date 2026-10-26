from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authtoken.models import Token
from .serializers import RegisterSerializer, LoginSerializer, UserSerializer


class RegisterView(APIView):
    """
    POST /api/auth/register/
    Registers a new user with hashed password and generates an auth token.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            token, _ = Token.objects.get_or_create(user=user)
            return Response(
                {
                    "message": "User registered successfully.",
                    "user": UserSerializer(user).data,
                    "token": token.key
                },
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    """
    POST /api/auth/login/
    Verifies credentials and returns an auth token.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            token, _ = Token.objects.get_or_create(user=user)
            return Response(
                {
                    "message": "Login successful.",
                    "token": token.key,
                    "user": UserSerializer(user).data
                },
                status=status.HTTP_200_OK
            )
        return Response(
            {"error": "Invalid username or password.", "details": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST
        )


class CurrentUserView(APIView):
    """
    GET /api/auth/me/
    Returns basic profile information for the authenticated user.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)


class LogoutView(APIView):
    """
    POST /api/auth/logout/
    Revokes the current authentication token.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            # Delete token to log out
            request.user.auth_token.delete()
        except Exception:
            pass
        return Response(
            {"message": "Logged out successfully."},
            status=status.HTTP_200_OK
        )
