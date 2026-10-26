from django.contrib.auth.models import User
from django.contrib.auth.hashers import check_password
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework.authtoken.models import Token


class AccountsAuthTests(APITestCase):
    """
    Automated test suite for User Registration, Authentication, and Password Security.
    """

    def setUp(self):
        self.register_url = reverse('auth-register')
        self.login_url = reverse('auth-login')
        self.me_url = reverse('auth-me')
        self.logout_url = reverse('auth-logout')

        self.valid_user_payload = {
            "username": "sathwik_dev",
            "email": "sathwik@example.com",
            "password": "SecurePassword2026!"
        }

        # Create a pre-existing user for login and duplicate tests
        self.existing_user = User.objects.create_user(
            username="existing_user",
            email="existing@example.com",
            password="StrongPassword123"
        )
        self.existing_token, _ = Token.objects.get_or_create(user=self.existing_user)

    def test_user_registration_success(self):
        """Test successful registration with valid input and token generation."""
        response = self.client.post(self.register_url, self.valid_user_payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('token', response.data)
        self.assertIn('user', response.data)
        self.assertEqual(response.data['user']['username'], 'sathwik_dev')
        self.assertEqual(response.data['user']['email'], 'sathwik@example.com')
        # Ensure password is never exposed in response
        self.assertNotIn('password', response.data['user'])

        # Verify user is in database
        self.assertTrue(User.objects.filter(username='sathwik_dev').exists())

    def test_password_hashing(self):
        """Test that passwords are never stored in plain-text and use Django password hashing."""
        self.client.post(self.register_url, self.valid_user_payload, format='json')
        user = User.objects.get(username='sathwik_dev')

        # Raw password must not equal stored hash
        self.assertNotEqual(user.password, self.valid_user_payload['password'])
        # Must verify using Django check_password
        self.assertTrue(check_password(self.valid_user_payload['password'], user.password))
        # Must use PBKDF2/Argon2/bcrypt algorithm
        self.assertTrue(user.password.startswith('pbkdf2_sha256$'))

    def test_registration_duplicate_username(self):
        """Test duplicate username rejection."""
        payload = {
            "username": "existing_user",
            "email": "different@example.com",
            "password": "AnotherPassword123"
        }
        response = self.client.post(self.register_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('username', response.data)

    def test_registration_invalid_data(self):
        """Test validation error rejection for empty/short inputs."""
        # Short password (< 8 chars)
        response = self.client.post(self.register_url, {
            "username": "shortpass",
            "email": "short@example.com",
            "password": "123"
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        # Blank username
        response = self.client.post(self.register_url, {
            "username": "",
            "email": "test@example.com",
            "password": "StrongPassword123"
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        # Invalid email format
        response = self.client.post(self.register_url, {
            "username": "invalid_email_user",
            "email": "not-an-email",
            "password": "StrongPassword123"
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_successful_login(self):
        """Test login with valid credentials returns an authentication token."""
        payload = {
            "username": "existing_user",
            "password": "StrongPassword123"
        }
        response = self.client.post(self.login_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('token', response.data)
        self.assertEqual(response.data['token'], self.existing_token.key)
        self.assertEqual(response.data['user']['username'], 'existing_user')

    def test_invalid_login_wrong_password(self):
        """Test login failure with incorrect password returns HTTP 400."""
        payload = {
            "username": "existing_user",
            "password": "WrongPassword999"
        }
        response = self.client.post(self.login_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)

    def test_invalid_login_nonexistent_user(self):
        """Test login failure with non-existent user returns HTTP 400."""
        payload = {
            "username": "ghost_user",
            "password": "SomePassword123"
        }
        response = self.client.post(self.login_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_current_user_with_token(self):
        """Test retrieving current user profile with valid Token header."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.existing_token.key}')
        response = self.client.get(self.me_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'existing_user')
        self.assertEqual(response.data['email'], 'existing@example.com')

    def test_current_user_without_token(self):
        """Test accessing /api/auth/me/ without token returns HTTP 401."""
        response = self.client.get(self.me_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_logout(self):
        """Test token revocation on logout."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.existing_token.key}')
        response = self.client.post(self.logout_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Token should be deleted from DB
        self.assertFalse(Token.objects.filter(key=self.existing_token.key).exists())
