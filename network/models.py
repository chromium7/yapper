from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    profile_desc = models.CharField(max_length=300, blank=True, null=True)
    profile_pic = models.ImageField(blank=True, null=True)


class Following(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="followings")
    follow = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="followers")


class Post(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="posts")
    text = models.CharField(max_length=300)
    time = models.DateTimeField(auto_now_add=True)
    like = models.BooleanField(default=False)
    like_count = models.IntegerField(default=0)


class Reply(Post):
    post = models.ForeignKey(
        Post, on_delete=models.CASCADE, related_name="replies")
