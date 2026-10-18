from rest_framework import serializers
from .models import Payment


class PaymentSerializer(serializers.ModelSerializer):
    client_name = serializers.SerializerMethodField()
    project_name = serializers.SerializerMethodField()
    invoice_number = serializers.SerializerMethodField()
    recorded_by_name = serializers.SerializerMethodField()

    class Meta:
        model = Payment
        fields = '__all__'
        read_only_fields = ['id', 'recorded_by', 'created_at', 'updated_at']

    def get_client_name(self, obj):
        return obj.client.name if obj.client else None

    def get_project_name(self, obj):
        return obj.project.name if obj.project else None

    def get_invoice_number(self, obj):
        return obj.invoice.invoice_number if obj.invoice else None

    def get_recorded_by_name(self, obj):
        return obj.recorded_by.full_name if obj.recorded_by else None

    def validate(self, data):
        invoice = data.get('invoice')
        amount = data.get('amount')
        if invoice and amount:
            if amount > invoice.pending_amount:
                raise serializers.ValidationError(
                    {'amount': f'Payment amount cannot exceed pending amount of {invoice.pending_amount}'}
                )
        return data
