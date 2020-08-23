from django.test import Client, TestCase
from django.contrib import auth
from .models import *


# Testing login form
class AccountTestCase(TestCase):

    def setUp(self):
        # Create an account
        self.user = User.objects.create_user(username="mjordan",
                                             email="mjordan@example.com", password="mjordan123")

    def test_register_account(self):
        response = self.client.post('/register', {
            'username': 'jdoe',
            'email': 'jdoe@example.com',
            'password': 'jdoe123',
            'confirmation': 'jdoe123'
        }, follow=True)
        self.assertTrue(response.context['user'].is_authenticated)

    def test_register_duplicate_account(self):
        response = self.client.post('/register', {
            'username': 'mjordan',
            'email': 'mjordan@example.com',
            'password': 'mjordan123',
            'confirmation': 'mjordan123'
        })
        self.assertFalse(response.context['user'].is_authenticated)

    def test_login_success(self):
        response = self.client.post('/login', {
            'username': 'mjordan',
            'password': 'mjordan123'
        }, follow=True)
        self.assertTrue(response.context['user'].is_authenticated)

    def test_login_fail(self):
        response = self.client.post('/login', {
            'username': 'mjordan123',
            'password': 'mjordan'
        })
        self.assertFalse(response.context['user'].is_authenticated)

# Test


class ModelTestCase(TestCase):

    def setUp(self):
        pass
