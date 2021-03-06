from django.conf.urls.static import static
from django.conf import settings
from django.urls import path

from . import views

urlpatterns = [
    # Main
    path("", views.index, name="index"),

    # Login
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),

    # API Routes
    path("api/follow/<str:category>", views.follow, name="following"),
    path("api/posts/<str:category>", views.posts, name="post"),
    path("api/replies/<int:post_id>", views.replies, name="replies"),
    path("api/profile/<str:username>", views.profile, name="profile"),
    path("api/edit/<int:post_id>", views.edit, name="edit"),
    path("api/heart/<int:post_id>", views.heart, name="heart"),
    path("api/write", views.write_post, name="write"),

] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
