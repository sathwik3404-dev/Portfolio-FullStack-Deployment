from django.urls import path
from .views import ProjectListCreateView, ProjectDetailView, PublicProjectListView, PublicProjectDetailView

urlpatterns = [
    path('', ProjectListCreateView.as_view(), name='project-list-create'),
    path('public/', PublicProjectListView.as_view(), name='project-public-list'),
    path('public/<int:id>/', PublicProjectDetailView.as_view(), name='project-public-detail'),
    path('<int:id>/', ProjectDetailView.as_view(), name='project-detail'),
]
