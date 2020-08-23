
from django.urls import path

from . import views

urlpatterns = [
    # Main
    path("", views.index, name="index"),
    path("following", views.following, name="following"),
    path("<int:post_id>", views.post, name="post"),

    # Login
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),

    # Profile
    path("<str:username>", views.profile, name="profile"),

]
