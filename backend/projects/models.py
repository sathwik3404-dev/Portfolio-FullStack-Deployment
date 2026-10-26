from django.db import models
from django.contrib.auth.models import User


class Project(models.Model):
    """
    Portfolio project model managed by authenticated owners.
    """
    title = models.CharField(max_length=200, help_text="Title of the project")
    description = models.TextField(help_text="Detailed project description")
    technologies = models.CharField(
        max_length=255,
        help_text="Comma-separated or list of technologies used (e.g. React, Node.js, ESP32)"
    )
    github_url = models.URLField(
        blank=True,
        default='',
        max_length=500,
        help_text="GitHub repository URL"
    )
    live_demo_url = models.URLField(
        blank=True,
        default='',
        max_length=500,
        help_text="Live demo or deployment URL"
    )
    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='projects',
        help_text="The authenticated user who owns this project"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} ({self.owner.username})"
