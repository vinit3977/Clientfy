from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import RegisterView, LoginView, UserProfileView

urlpatterns = [
    path("register/", RegisterView.as_view(), name="auth_register"),
    path("login/", LoginView.as_view(), name="auth_login"),
    path("profile/", UserProfileView.as_view(), name="auth_profile"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]
