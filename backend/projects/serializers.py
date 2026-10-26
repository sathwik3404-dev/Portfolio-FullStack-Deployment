from rest_framework import serializers
from .models import Project


class ProjectSerializer(serializers.ModelSerializer):
    """
    Serializer for Portfolio Project CRUD operations.
    Owner is automatically associated with the authenticated user.
    """
    owner_username = serializers.ReadOnlyField(source='owner.username')
    owner = serializers.ReadOnlyField(source='owner.id')

    class Meta:
        model = Project
        fields = [
            'id',
            'title',
            'description',
            'technologies',
            'github_url',
            'live_demo_url',
            'created_at',
            'updated_at',
            'owner',
            'owner_username'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'owner', 'owner_username']

    def validate_title(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Project title cannot be empty.")
        if len(value.strip()) < 2:
            raise serializers.ValidationError("Project title must be at least 2 characters long.")
        return value.strip()

    def validate_description(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Project description cannot be empty.")
        return value.strip()

    def validate_technologies(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Technologies used cannot be empty.")
        return value.strip()


class PublicProjectSerializer(serializers.ModelSerializer):
    """
    Read-only serializer for public portfolio projects display.
    """
    owner_username = serializers.ReadOnlyField(source='owner.username')

    class Meta:
        model = Project
        fields = [
            'id',
            'title',
            'description',
            'technologies',
            'github_url',
            'live_demo_url',
            'created_at',
            'owner_username'
        ]
        read_only_fields = fields
