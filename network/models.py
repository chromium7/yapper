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

    def __str__(self):
        return f"{self.user} is following {self.follow}"


class Post(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="posts")
    text = models.CharField(max_length=300)
    time = models.DateTimeField(auto_now_add=True)

    def serialize(self):
        return {
            "id": self.id,
            "user": self.user,
            "text": self.text,
            "time": self.time
        }


class Reply(Post):
    class Meta:
        verbose_name_plural = "replies"

    post = models.ForeignKey(
        Post, on_delete=models.CASCADE, related_name="replies")


class Like(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="likes")
    post = models.ForeignKey(
        Post, on_delete=models.CASCADE, related_name="likes")
