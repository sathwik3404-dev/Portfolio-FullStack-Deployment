from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework.authtoken.models import Token
from .models import Project


class ProjectsCRUDTests(APITestCase):
    """
    Automated test suite covering:
    - Token authentication enforcement (401)
    - Project creation (201)
    - Listing projects (user-isolated)
    - Retrieving a project (200)
    - Full update PUT (200)
    - Partial update PATCH (200)
    - Project deletion (204)
    - Rejection of empty / malformed data (400)
    - Strict cross-user isolation and authorization prevention (403/404)
    - Public project listing
    """

    def setUp(self):
        self.list_create_url = reverse('project-list-create')
        self.public_list_url = reverse('project-public-list')

        # User 1 (Owner of Project 1)
        self.user1 = User.objects.create_user(
            username="user_one",
            email="user1@example.com",
            password="Password123"
        )
        self.token1, _ = Token.objects.get_or_create(user=self.user1)

        # User 2 (Different User)
        self.user2 = User.objects.create_user(
            username="user_two",
            email="user2@example.com",
            password="Password456"
        )
        self.token2, _ = Token.objects.get_or_create(user=self.user2)

        # Create sample project for user 1
        self.project1 = Project.objects.create(
            title="Fuelup On Demand",
            description="On-demand fuel delivery web application",
            technologies="React, Node.js, JavaScript",
            github_url="https://github.com/sathwik3404-dev/fuelup",
            live_demo_url="https://fuelup.example.com",
            owner=self.user1
        )

        self.project1_detail_url = reverse('project-detail', kwargs={'id': self.project1.id})

    def test_access_projects_unauthenticated_returns_401(self):
        """Unauthenticated requests to CRUD endpoints must return HTTP 401."""
        # Unauthenticated GET list
        response = self.client.get(self.list_create_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        # Unauthenticated POST create
        response = self.client.post(self.list_create_url, {
            "title": "Unauthorized Project",
            "description": "Should fail",
            "technologies": "Python"
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        # Unauthenticated GET detail
        response = self.client.get(self.project1_detail_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_project_with_valid_token(self):
        """Creating a project with a valid auth token returns 201 and assigns owner."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token1.key}')
        payload = {
            "title": "Air Quality Station",
            "description": "ESP32 weather and air quality monitoring station",
            "technologies": "ESP32, Embedded C, DHT11, ThingSpeak",
            "github_url": "https://github.com/sathwik3404-dev/air-quality",
            "live_demo_url": "https://thingspeak.com/channels/demo"
        }
        response = self.client.post(self.list_create_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], payload['title'])
        self.assertEqual(response.data['owner_username'], self.user1.username)
        self.assertEqual(response.data['owner'], self.user1.id)
        self.assertIn('id', response.data)
        self.assertIn('created_at', response.data)

        # Verify persisted in database
        self.assertTrue(Project.objects.filter(title="Air Quality Station", owner=self.user1).exists())

    def test_list_projects_authenticated(self):
        """Listing projects returns only projects owned by the authenticated user."""
        # Create a project owned by user 2
        Project.objects.create(
            title="User 2 Secret Project",
            description="Private data of user 2",
            technologies="Django",
            owner=self.user2
        )

        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token1.key}')
        response = self.client.get(self.list_create_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Should only contain project1, not user2's project
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['id'], self.project1.id)
        self.assertEqual(response.data[0]['title'], self.project1.title)

    def test_retrieve_individual_project(self):
        """Retrieve individual project with valid token returns HTTP 200."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token1.key}')
        response = self.client.get(self.project1_detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], self.project1.title)
        self.assertEqual(response.data['description'], self.project1.description)

    def test_update_project_put(self):
        """Full update via PUT returns HTTP 200 and modifies the record."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token1.key}')
        payload = {
            "title": "Fuelup Pro Version",
            "description": "Updated description with real-time driver tracking",
            "technologies": "React, Node.js, Socket.io",
            "github_url": "https://github.com/sathwik3404-dev/fuelup-pro",
            "live_demo_url": "https://fuelup-pro.example.com"
        }
        response = self.client.put(self.project1_detail_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.project1.refresh_from_db()
        self.assertEqual(self.project1.title, "Fuelup Pro Version")
        self.assertEqual(self.project1.technologies, "React, Node.js, Socket.io")

    def test_partial_update_project_patch(self):
        """Partial update via PATCH returns HTTP 200 and modifies only targeted fields."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token1.key}')
        payload = {
            "title": "Fuelup: Patched Edition"
        }
        response = self.client.patch(self.project1_detail_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.project1.refresh_from_db()
        self.assertEqual(self.project1.title, "Fuelup: Patched Edition")
        # Ensure description remains unchanged
        self.assertEqual(self.project1.description, "On-demand fuel delivery web application")

    def test_delete_project(self):
        """Deleting a project returns HTTP 204 No Content and removes it."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token1.key}')
        response = self.client.delete(self.project1_detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Project.objects.filter(id=self.project1.id).exists())

    def test_reject_empty_or_malformed_data(self):
        """Creating/updating with empty or malformed data returns HTTP 400 Bad Request."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token1.key}')

        # Empty title
        response = self.client.post(self.list_create_url, {
            "title": "",
            "description": "Some description",
            "technologies": "Python"
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('title', response.data)

        # Empty description
        response = self.client.post(self.list_create_url, {
            "title": "Valid Title",
            "description": "   ",
            "technologies": "Python"
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('description', response.data)

        # Invalid URL
        response = self.client.post(self.list_create_url, {
            "title": "Valid Title",
            "description": "Valid description",
            "technologies": "Python",
            "github_url": "not-a-valid-url"
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('github_url', response.data)

    def test_prevent_one_user_accessing_another_users_projects(self):
        """
        User 2 must NOT be able to view, edit, or delete User 1's project.
        Requests must be rejected with HTTP 403 Forbidden.
        """
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token2.key}')

        # User 2 tries to GET User 1's project detail
        response = self.client.get(self.project1_detail_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # User 2 tries to PUT User 1's project
        response = self.client.put(self.project1_detail_url, {
            "title": "Hacked Title",
            "description": "Hacked description",
            "technologies": "Malicious"
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # User 2 tries to PATCH User 1's project
        response = self.client.patch(self.project1_detail_url, {
            "title": "Hacked Title"
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # User 2 tries to DELETE User 1's project
        response = self.client.delete(self.project1_detail_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # Verify project1 is still intact in DB
        self.assertTrue(Project.objects.filter(id=self.project1.id).exists())

    def test_public_projects_endpoint(self):
        """Public project listing endpoint requires no authentication and returns 200."""
        # Unauthenticated request
        response = self.client.get(self.public_list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['title'], self.project1.title)
