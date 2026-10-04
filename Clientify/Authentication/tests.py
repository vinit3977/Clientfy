from django.test import TestCase
from django.contrib.auth.models import User
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.core import mail
from rest_framework.test import APIClient
from rest_framework import status


class PasswordResetTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="john@example.com",
            email="john@example.com",
            password="initialPassword123!",
            first_name="John",
        )

    def test_password_reset_request_success(self):
        response = self.client.post(
            "/api/auth/password-reset/",
            {"email": "john@example.com"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data.get("success"))
        # Verify email was dispatched via test outbox
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn("Reset Your Clientify Password", mail.outbox[0].subject)
        self.assertIn(self.user.email, mail.outbox[0].to)

    def test_password_reset_request_nonexistent_email(self):
        response = self.client.post(
            "/api/auth/password-reset/",
            {"email": "nonexistent@example.com"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data.get("success"))

    def test_password_reset_validate_token_valid(self):
        uid = urlsafe_base64_encode(force_bytes(self.user.pk))
        token = default_token_generator.make_token(self.user)

        response = self.client.get(
            f"/api/auth/password-reset/validate/?uid={uid}&token={token}"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data.get("valid"))
        self.assertEqual(response.data.get("email"), self.user.email)

    def test_password_reset_validate_token_invalid(self):
        uid = urlsafe_base64_encode(force_bytes(self.user.pk))
        token = "invalid-token-12345"

        response = self.client.get(
            f"/api/auth/password-reset/validate/?uid={uid}&token={token}"
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data.get("valid"))

    def test_password_reset_confirm_success(self):
        uid = urlsafe_base64_encode(force_bytes(self.user.pk))
        token = default_token_generator.make_token(self.user)
        new_password = "BrandNewSecurePassword789!"

        response = self.client.post(
            "/api/auth/password-reset/confirm/",
            {
                "uid": uid,
                "token": token,
                "password": new_password,
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data.get("success"))

        # Verify old password no longer works and new password works
        self.user.refresh_from_db()
        self.assertFalse(self.user.check_password("initialPassword123!"))
        self.assertTrue(self.user.check_password(new_password))

    def test_password_reset_confirm_invalid_token(self):
        uid = urlsafe_base64_encode(force_bytes(self.user.pk))
        token = "wrong-or-expired-token"

        response = self.client.post(
            "/api/auth/password-reset/confirm/",
            {
                "uid": uid,
                "token": token,
                "password": "NewPassword123!",
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data.get("success"))

    def test_password_reset_confirm_short_password(self):
        uid = urlsafe_base64_encode(force_bytes(self.user.pk))
        token = default_token_generator.make_token(self.user)

        response = self.client.post(
            "/api/auth/password-reset/confirm/",
            {
                "uid": uid,
                "token": token,
                "password": "123",  # less than 6 chars
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data.get("success"))
