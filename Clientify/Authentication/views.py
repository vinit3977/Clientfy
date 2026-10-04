from django.conf import settings
from django.core.mail import send_mail
from django.contrib.auth.models import User
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import (
    RegisterSerializer,
    LoginSerializer,
    UserSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
)

def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        "refresh": str(refresh),
        "access": str(refresh.access_token),
    }

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if not serializer.is_valid():
            first_field = next(iter(serializer.errors))
            first_err = serializer.errors[first_field]
            err_msg = first_err[0] if isinstance(first_err, list) else str(first_err)
            return Response(
                {
                    "success": False,
                    "error": err_msg,
                    "field": first_field,
                    "errors": serializer.errors,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = serializer.save()
        tokens = get_tokens_for_user(user)
        user_data = UserSerializer(user).data

        return Response(
            {
                "success": True,
                "message": "User registered successfully.",
                "user": user_data,
                "tokens": tokens,
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            first_field = next(iter(serializer.errors)) if serializer.errors else "non_field_errors"
            first_err = serializer.errors.get(first_field, ["Login failed"])
            err_msg = first_err[0] if isinstance(first_err, list) else str(first_err)
            return Response(
                {
                    "success": False,
                    "error": err_msg,
                    "field": first_field,
                },
                status=status.HTTP_401_UNAUTHORIZED,
            )

        user = serializer.validated_data["user"]
        tokens = get_tokens_for_user(user)
        user_data = UserSerializer(user).data

        return Response(
            {
                "success": True,
                "message": "Login successful.",
                "user": user_data,
                "tokens": tokens,
            },
            status=status.HTTP_200_OK,
        )


class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(
            {
                "success": True,
                "user": serializer.data,
            },
            status=status.HTTP_200_OK,
        )


class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        if not serializer.is_valid():
            first_field = next(iter(serializer.errors))
            first_err = serializer.errors[first_field]
            err_msg = first_err[0] if isinstance(first_err, list) else str(first_err)
            return Response(
                {
                    "success": False,
                    "error": err_msg,
                    "field": first_field,
                    "errors": serializer.errors,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        email = serializer.validated_data["email"]
        user = User.objects.filter(email__iexact=email).first() or User.objects.filter(username__iexact=email).first()

        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)

        frontend_url = getattr(settings, "FRONTEND_URL", "http://localhost:5173").rstrip("/")
        origin = request.META.get("HTTP_ORIGIN")
        if origin:
            frontend_url = origin.rstrip("/")

        reset_url = f"{frontend_url}/reset-password?uid={uid}&token={token}"

        # Compose notification email
        subject = "Reset Your Clientify Password"
        text_message = (
            f"Hello {user.first_name or user.username},\n\n"
            f"We received a request to reset your password for your Clientify account.\n\n"
            f"Click the link below to set a new password:\n{reset_url}\n\n"
            f"This link will expire in 24 hours.\n\n"
            f"If you did not request a password reset, please ignore this email. Your password will remain secure.\n\n"
            f"— The Clientify Team"
        )
        html_message = (
            f"<div style='font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif; max-width: 540px; margin: 0 auto; padding: 28px; border: 1px solid #e2e8f0; border-radius: 14px; background-color: #faf8f5;'>"
            f"<div style='text-align: center; margin-bottom: 24px;'>"
            f"<div style='width: 44px; height: 44px; margin: 0 auto 10px; background-color: #490b1a; color: #fff; font-size: 22px; font-weight: bold; line-height: 44px; border-radius: 10px;'>C</div>"
            f"<h2 style='color: #490b1a; margin: 0; font-size: 24px;'>Clientify</h2>"
            f"</div>"
            f"<p style='color: #2d3748; font-size: 15px; line-height: 1.6;'>Hello <strong>{user.first_name or user.username}</strong>,</p>"
            f"<p style='color: #4a5568; font-size: 14px; line-height: 1.6;'>We received a request to reset the password for your Clientify account. Click the button below to choose a new password:</p>"
            f"<div style='text-align: center; margin: 30px 0;'>"
            f"<a href='{reset_url}' style='background-color: #490b1a; color: #ffffff; padding: 13px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; font-size: 14px; box-shadow: 0 4px 12px rgba(73, 11, 26, 0.2);'>Reset Password</a>"
            f"</div>"
            f"<p style='color: #718096; font-size: 13px; line-height: 1.5;'>Or copy and paste this link into your browser:<br/><a href='{reset_url}' style='color: #490b1a; word-break: break-all; font-weight: 500;'>{reset_url}</a></p>"
            f"<p style='color: #a0aec0; font-size: 12px;'>Note: This link will expire in 24 hours.</p>"
            f"<hr style='border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;' />"
            f"<p style='color: #a0aec0; font-size: 12px; margin-bottom: 0;'>If you did not request this reset, you can safely ignore this email. Your account credentials will remain unchanged.</p>"
            f"</div>"
        )

        try:
            send_mail(
                subject=subject,
                message=text_message,
                from_email=getattr(settings, "DEFAULT_FROM_EMAIL", "noreply@clientify.com"),
                recipient_list=[user.email],
                html_message=html_message,
                fail_silently=False,
            )
        except Exception as e:
            # Fallback for unexpected mail backend errors
            pass

        response_payload = {
            "success": True,
            "message": "Password reset instructions have been sent to your email address.",
        }

        # Provide debug convenience during development
        if getattr(settings, "DEBUG", False):
            response_payload["debug_reset_url"] = reset_url
            response_payload["uid"] = uid
            response_payload["token"] = token

        return Response(response_payload, status=status.HTTP_200_OK)


class PasswordResetValidateTokenView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        uidb64 = request.query_params.get("uid")
        token = request.query_params.get("token")

        if not uidb64 or not token:
            return Response(
                {
                    "valid": False,
                    "error": "Reset link is missing user or token parameters.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response(
                {
                    "valid": False,
                    "error": "The reset link is invalid or corresponds to a non-existent user.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not user.is_active:
            return Response(
                {
                    "valid": False,
                    "error": "This account is inactive.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not default_token_generator.check_token(user, token):
            return Response(
                {
                    "valid": False,
                    "error": "This password reset token has expired or has already been used.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {
                "valid": True,
                "message": "Token is valid.",
                "email": user.email,
                "name": user.first_name,
            },
            status=status.HTTP_200_OK,
        )


class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        if not serializer.is_valid():
            first_field = next(iter(serializer.errors))
            first_err = serializer.errors[first_field]
            err_msg = first_err[0] if isinstance(first_err, list) else str(first_err)
            return Response(
                {
                    "success": False,
                    "error": err_msg,
                    "field": first_field,
                    "errors": serializer.errors,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = serializer.save()
        return Response(
            {
                "success": True,
                "message": "Your password has been successfully reset! You can now log in.",
            },
            status=status.HTTP_200_OK,
        )
