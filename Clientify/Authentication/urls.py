from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView,
    LoginView,
    UserProfileView,
    PasswordResetRequestView,
    PasswordResetValidateTokenView,
    PasswordResetConfirmView,
)

app_name = "authentication"

urlpatterns = [
    path("register/", RegisterView.as_view(), name="auth_register"),
    path("login/", LoginView.as_view(), name="auth_login"),
    path("profile/", UserProfileView.as_view(), name="auth_profile"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("password-reset/", PasswordResetRequestView.as_view(), name="password_reset_request"),
    path("password-reset/validate/", PasswordResetValidateTokenView.as_view(), name="password_reset_validate"),
    path("password-reset/confirm/", PasswordResetConfirmView.as_view(), name="password_reset_confirm"),
    # Convenient aliases
    path("forgot-password/", PasswordResetRequestView.as_view(), name="forgot_password"),
    path("reset-password/", PasswordResetConfirmView.as_view(), name="reset_password"),
]
