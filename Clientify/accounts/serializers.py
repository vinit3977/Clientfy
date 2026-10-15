from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model

User = get_user_model()


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user

        if user.status != 'active':
            raise serializers.ValidationError(
                {'detail': 'Your account is inactive or suspended. Please contact the administrator.'}
            )

        data['user'] = {
            'id': user.id,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'full_name': user.full_name,
            'role': user.role,
            'status': user.status,
            'avatar': user.avatar.url if user.avatar else None,
            'currency': user.currency,
            'currency_symbol': user.currency_symbol,
        }
        return data

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['role'] = user.role
        token['full_name'] = user.full_name
        token['email'] = user.email
        return token


class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()
    created_by_name = serializers.SerializerMethodField()
    password = serializers.CharField(write_only=True, required=False, min_length=6)

    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'full_name',
            'phone', 'role', 'status', 'avatar', 'department', 'bio',
            'currency', 'currency_symbol',
            'date_joined', 'created_at', 'updated_at',
            'created_by', 'created_by_name', 'password'
        ]
        read_only_fields = ['id', 'date_joined', 'created_at', 'updated_at', 'created_by']

    def get_created_by_name(self, obj):
        if obj.created_by:
            return obj.created_by.full_name
        return None

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = User(**validated_data)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance


class UserListSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()

    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'full_name', 'role', 'status', 'avatar', 'department', 'phone']


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, min_length=6)


class UpdateProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'phone', 'department', 'bio', 'avatar', 'currency', 'currency_symbol']
