from rest_framework import serializers
from .models import Invoice


class InvoiceSerializer(serializers.ModelSerializer):
    client_name = serializers.SerializerMethodField()
    project_name = serializers.SerializerMethodField()
    created_by_name = serializers.SerializerMethodField()
    pending_amount = serializers.ReadOnlyField()

    class Meta:
        model = Invoice
        fields = '__all__'
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at', 'paid_amount']

    def get_client_name(self, obj):
        return obj.client.name if obj.client else None

    def get_project_name(self, obj):
        return obj.project.name if obj.project else None

    def get_created_by_name(self, obj):
        return obj.created_by.full_name if obj.created_by else None

    def create(self, validated_data):
        invoice = Invoice(**validated_data)
        if not invoice.invoice_number:
            invoice.invoice_number = invoice.generate_invoice_number()
        invoice.save()
        return invoice