from django.test import TestCase
from django.contrib.auth import authenticate
from custom_auth.models import User

class CustomAuthBackendTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            password='securepassword'
        )

    def test_authenticate_success(self):
        user = authenticate(email='test@example.com', password='securepassword')
        self.assertIsNotNone(user)
        self.assertEqual(user.email, 'test@example.com')

    def test_authenticate_failure(self):
        user = authenticate(email='test@example.com', password='wrongpassword')
        self.assertIsNone(user)
