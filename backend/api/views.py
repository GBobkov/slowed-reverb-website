from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import UserSerializer, RegisterSerializer

User = get_user_model()

class RegisterAPIView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = (AllowAny,)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            print(serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        user = serializer.save()

        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)

        res = Response({
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "token": access_token,
        }, status=status.HTTP_201_CREATED)

        res.set_cookie(
            key="refresh_token",
            value=refresh_token,
            httponly=True,
            samesite="None",
            secure=False,
            max_age=7*24*3600,
            path="/api/",
        )
        return res


class LoginAPIView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")
        if not email or not password:
            return Response({"detail": "Email and password required"}, status=400)
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"detail": "Invalid credentials"}, status=401)

        if not user.check_password(password):
            return Response({"detail": "Invalid credentials"}, status=401)

        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)

        res = Response({
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "token": access_token,
        })

        res.set_cookie(
            key="refresh_token",
            value=str(refresh),
            httponly=True,
            secure=False,
            samesite="None",
            max_age=7 * 24 * 3600,
            path="/",
        )

        return res


class LogoutAPIView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        refresh_token = request.COOKIES.get("refresh_token")
        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
            except:
                pass

        res = Response({"detail": "Logged out"}, status=200)
        res.delete_cookie("refresh_token", path="/")
        return res

class MeAPIView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        user = request.user
        return Response({
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
        })

class TokenRefreshFromCookieAPIView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        refresh_token = request.COOKIES.get("refresh_token")
        if not refresh_token:
            return Response({"detail": "No refresh token cookie"}, status=401)
        try:
            token = RefreshToken(refresh_token)
            access = str(token.access_token)
            return Response({"access": access})
        except Exception:
            return Response({"detail": "Invalid refresh token"}, status=401)
