import json

from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import JsonResponse, HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt

from .models import User, Following, Post, Reply, Like


def index(request):
    return render(request, "network/index.html")


def follow(request, category):
    return


def posts(request, category):
    current_user = request.user
    if category == "all-posts":
        posts = Post.objects.all()
    elif category == "feeds":
        posts = []
        user_followings = current_user.followings.all()
        if user_followings:
            for followed_user in user_followings:
                posts += followed_user.posts
    elif category == "liked":
        liked = current_user.likes.all()
        posts = [like.post for like in liked]

    if posts:
        posts = posts.order_by("-time")
    return JsonResponse([post.serialize() for post in posts], safe=False)


def profile(request, username):
    return


@csrf_exempt
@login_required
def write_post(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST request required"}, status=400)

    data = json.loads(request.body)

    user = request.user
    text = data.get("text", "")

    post = Post(user=user, text=text)
    post.save()

    return JsonResponse({"message": "Email sent successfully"}, status=201)


def replies(request, post_id):
    if request.method == "POST":
        # reply to a post
        pass
    elif request.method == "GET":
        # get replies for post
        pass


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
