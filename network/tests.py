from django.test import Client, TestCase, tag
from django.contrib import auth
from .models import *


# Testing login form
@tag('login')
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


# Testing models
@tag('model')
class ModelTestCase(TestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            username="mjordan", email="mjordan@example.com", password="mjordan123")
        self.johny = User.objects.create_user(
            username="johny", email="johny@example.com", password="johny123")
        self.tom = User.objects.create_user(
            username="tom", email="tom@example.com", password="tom123")

    def test_create_post(self):
        new_post = Post.objects.create(user=self.user, text="Hello, world")
        post_likes = new_post.like.all()
        post_replies = new_post.replies.all()
        self.assertIsInstance(new_post, Post)
        self.assertEqual(len(post_likes), 0)
        self.assertEqual(len(post_replies), 0)

    def test_create_reply(self):
        new_post = Post.objects.create(user=self.user, text="Hello, world")
        reply = Reply.objects.create(
            user=self.johny, text="Reply", post=new_post)
        self.assertIsInstance(reply, Reply)

    def test_like_post(self):
        new_post = Post.objects.create(user=self.user, text="Hello, world")
        new_post.like.add(self.user)

        self.assertEqual(new_post.like.count(), 1)

    def test_get_liked_post(self):
        new_post = Post.objects.create(user=self.user, text="Hello, world")
        new_post.like.add(self.user)

        liked_posts = self.user.likes.all()
        self.assertEqual(liked_posts[0], new_post)

    def test_create_following(self):
        following = Following.objects.create(user=self.user, follow=self.johny)
        self.assertIsInstance(following, Following)

    def test_get_user_followers(self):
        new_following = Following.objects.create(
            user=self.user, follow=self.johny)
        self.assertEqual(self.johny.followers.count(), 1)

    def test_get_user_followings(self):
        new_following = Following.objects.create(
            user=self.user, follow=self.johny)
        self.assertEqual(self.user.followings.count(), 1)

    def test_serialize(self):
        serialized_obj = self.user.serialize()
        self.assertEqual(serialized_obj['name'], self.user.username)
        self.assertEqual(serialized_obj['email'], self.user.email)
        self.assertEqual(serialized_obj['desc'], self.user.profile_desc)
        self.assertEqual(
            serialized_obj['followingCount'], self.user.followings.count())
        self.assertEqual(
            serialized_obj['followerCount'], self.user.followers.count())
