from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from .models import Project
from .serializers import ProjectSerializer, PublicProjectSerializer
from .permissions import IsOwner


class ProjectListCreateView(generics.ListCreateAPIView):
    """
    GET /api/projects/
    Lists all projects belonging to the authenticated user.

    POST /api/projects/
    Creates a new project owned by the authenticated user.
    """
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Strict user isolation: only return projects owned by current user
        return Project.objects.filter(owner=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        # Automatically set owner to current authenticated user
        serializer.save(owner=self.request.user)


class ProjectDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET /api/projects/<id>/
    Retrieves a single project owned by the authenticated user.

    PUT /api/projects/<id>/
    Fully updates a project owned by the authenticated user.

    PATCH /api/projects/<id>/
    Partially updates a project owned by the authenticated user.

    DELETE /api/projects/<id>/
    Deletes a project owned by the authenticated user.
    """
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated, IsOwner]
    lookup_field = 'id'

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(
            {"message": f"Project '{instance.title}' was successfully deleted."},
            status=status.HTTP_204_NO_CONTENT
        )


class PublicProjectListView(generics.ListAPIView):
    """
    GET /api/projects/public/
    Public read-only listing of portfolio projects for public visitors.
    Does not require authentication.
    """
    queryset = Project.objects.all().order_by('-created_at')
    serializer_class = PublicProjectSerializer
    permission_classes = [AllowAny]


class PublicProjectDetailView(generics.RetrieveAPIView):
    """
    GET /api/projects/public/<id>/
    Public read-only details of a single portfolio project.
    Does not require authentication.
    """
    queryset = Project.objects.all()
    serializer_class = PublicProjectSerializer
    permission_classes = [AllowAny]
    lookup_field = 'id'
