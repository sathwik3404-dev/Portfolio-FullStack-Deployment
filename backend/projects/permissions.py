from rest_framework import permissions


class IsOwner(permissions.BasePermission):
    """
    Object-level permission to only allow owners of a project to read, modify, or delete it.
    """

    def has_object_permission(self, request, view, obj):
        # Only the project's owner is permitted
        return obj.owner == request.user
