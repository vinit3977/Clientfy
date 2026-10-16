from django.db import models
from django.conf import settings
from clients.models import Client
from projects.models import Project


def document_upload_path(instance, filename):
    return f"documents/{instance.document_type}/{filename}"


class Document(models.Model):
    TYPE_CHOICES = [
        ('contract', 'Contract'),
        ('proposal', 'Proposal'),
        ('invoice', 'Invoice'),
        ('agreement', 'Agreement'),
        ('project_file', 'Project File'),
        ('brand_asset', 'Brand Asset'),
        ('report', 'Report'),
        ('other', 'Other'),
    ]

    name = models.CharField(max_length=300)
    document_type = models.CharField(max_length=50, choices=TYPE_CHOICES, default='other')
    client = models.ForeignKey(Client, on_delete=models.CASCADE, null=True, blank=True, related_name='documents')
    project = models.ForeignKey(Project, on_delete=models.CASCADE, null=True, blank=True, related_name='documents')
    file = models.FileField(upload_to=document_upload_path)
    file_size = models.IntegerField(default=0)  # bytes
    file_type = models.CharField(max_length=50, blank=True)  # MIME type
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='uploaded_documents'
    )
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'documents'
        ordering = ['-created_at']

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if self.file:
            self.file_size = self.file.size
            self.file_type = self.file.name.split('.')[-1].upper() if '.' in self.file.name else 'FILE'
        super().save(*args, **kwargs)
