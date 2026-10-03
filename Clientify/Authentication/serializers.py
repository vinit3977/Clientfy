from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework.exceptions import AuthenticationFailed
from .models import Profile

class UserSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source="first_name")
    role = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ("id", "name", "email", "role", "date_joined")

    def get_role(self, obj):
        if hasattr(obj, "profile"):
            return obj.profile.role
        return "Employee"


class RegisterSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=150, required=True, trim_whitespace=True)
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, min_length=6, required=True)
    role = serializers.ChoiceField(choices=["Employee", "Manager"], default="Employee")

    def validate_name(self, value):
        if len(value.strip()) < 2:
            raise serializers.ValidationError("Enter a valid name (at least 2 characters).")
        return value.strip()

    def validate_email(self, value):
        email_clean = value.lower().strip()
        if User.objects.filter(email__iexact=email_clean).exists() or User.objects.filter(username__iexact=email_clean).exists():
            raise serializers.ValidationError("A user with this email address already exists.")
        return email_clean

    def create(self, validated_data):
        name = validated_data["name"]
        email = validated_data["email"]
        password = validated_data["password"]
        role = validated_data.get("role", "Employee")

        # Create user with email as username for consistency
        user = User.objects.create_user(
            username=email,
            email=email,
            password=password,
            first_name=name,
        )

        profile, _ = Profile.objects.get_or_create(user=user)
        profile.role = role
        profile.save()
        user.profile = profile

        return user



class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=True)
    role = serializers.CharField(required=False, allow_blank=True)

    def validate(self, attrs):
        email = attrs.get("email", "").lower().strip()
        password = attrs.get("password")

        user = User.objects.filter(email__iexact=email).first()
        if not user:
            user = User.objects.filter(username__iexact=email).first()

        if not user or not user.check_password(password):
            raise AuthenticationFailed("Invalid email or password.")

        if not user.is_active:
            raise AuthenticationFailed("This account has been disabled.")

        attrs["user"] = user
        return attrs


