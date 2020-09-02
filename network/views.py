import json
import re
import base64

from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import JsonResponse, HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt
from django.core.paginator import Paginator
from django.core.files.base import ContentFile
from django.core.exceptions import ObjectDoesNotExist

from .models import User, Following, Post, Reply


def index(request):
    return render(request, "network/index.html")


def profile(request, username):
    user = User.objects.get(username=username)
    current_user = request.user

    if request.method == "POST":
        # Update profile
        data = json.loads(request.body)
        desc = data.get("desc", "")
        user.profile_desc = desc
        user.save()

        # IMAGE
        dataUrlPattern = re.compile('data:image/(png|jpeg);base64,(.*)$')
        img = data.get("img", "")
        img = dataUrlPattern.match(img).group(2)
        img = base64.b64decode(img)
        file_data = ContentFile(img)

        user.profile_pic.save(f"{username}-pic", file_data)

        return JsonResponse({"message": "Profile successfully updated"}, status=201)

    elif request.method == "GET":
        # Get profile
        if current_user == user:
            response = user.serialize()
        else:
            followings = [
                user.follow for user in current_user.followings.all()]

            if user in followings:
                followed = True
            else:
                followed = False
            response = user.serialize()
            response['followed'] = followed

        # Get user posts
        posts = user.posts.all()
        if posts:
            posts = posts.order_by("-time")
        posts = [post.serialize() for post in posts]

        return JsonResponse([response, posts], safe=False)

    elif request.method == "PUT":
        # Follow user
        try:
            current_user.followings.get(follow=user).delete()
            return JsonResponse({"message": "User unfollowed"}, status=201)

        except ObjectDoesNotExist:
            follow = Following(user=current_user, follow=user)
            follow.save()
            return JsonResponse({"message": "User followed"}, status=201)


def follow(request, category):
    current_user = request.user
    if category == "followings":
        accounts = [user.follow for user in current_user.followings.all()]
    else:
        accounts = [user.user for user in current_user.followers.all()]
    return JsonResponse([user.serialize() for user in accounts], safe=False)


def posts(request, category):
    page = request.GET.get("page", "")

    current_user = request.user

    if category == "all-posts":
        posts = Post.objects.all()

    elif category == "feeds":
        posts = []
        user_followings = current_user.followings.all()
        if user_followings:
            posts = Post.objects.filter(
                user__in=user_followings.values('follow'))

    elif category == "liked":
        posts = current_user.likes.all()

    elif category.startswith("profile"):
        username = category.split("_")[1]
        user = User.objects.get(username=username)
        posts = user.posts.all()

    if posts:
        posts = posts.order_by("-time")
        if page:
            posts = Paginator(posts, 10)
            posts = posts.page(page)
            previous = posts.has_previous()
            next = posts.has_next()
            return JsonResponse([[post.serialize() for post in posts], {"previous": previous, "next": next}], safe=False)

    return JsonResponse([post.serialize() for post in posts], safe=False)


def heart(request, post_id):

    if request.method != "PUT":
        return JsonResponse({
            "error": "PUT request required"
        }, status=400)
    current_user = request.user
    post = Post.objects.get(pk=post_id)

    if current_user in post.like.all():
        post.like.remove(current_user)
        return JsonResponse({"message": "unliked", "count": len(post.like.all())}, status=201)
    else:
        post.like.add(current_user)
        return JsonResponse({"message": "liked", "count": len(post.like.all())}, status=201)


def edit(request, post_id):
    post = Post.objects.get(pk=post_id)

    if request.method == "PUT":
        post.delete()
        return JsonResponse({"message": "Post deleted"}, status=201)
    elif request.method == "POST":
        data = json.loads(request.body)
        text = data.get("text", "")

        post.text = text
        post.save()

        return JsonResponse({"message": "Post successfully edited"}, status=201)
    else:
        return JsonResponse({"error": "POST request required"}, status=400)


@login_required
def write_post(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST request required"}, status=400)

    data = json.loads(request.body)

    user = request.user
    text = data.get("text", "")

    post = Post(user=user, text=text)
    post.save()

    return JsonResponse({"message": "Created new Yappies successfully"}, status=201)


def replies(request, post_id):
    post = Post.objects.get(id=post_id)
    if request.method == "POST":
        # reply to a post
        data = json.loads(request.body)
        user = request.user
        text = data.get("text", "")

        reply = Reply(user=user, text=text, post=post)
        reply.save()
        return JsonResponse(reply.serialize(), status=201)

    elif request.method == "GET":
        post_replies = Reply.objects.filter(post=post)

        return JsonResponse([reply.serialize() for reply in post_replies], safe=False)


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")
