from django.contrib import admin
from .models import Project


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ['id', 'title', 'owner', 'technologies', 'created_at', 'updated_at']
    list_filter = ['owner', 'created_at']
    search_fields = ['title', 'description', 'technologies', 'owner__username']
    ordering = ['-created_at']
