document.addEventListener('DOMContentLoaded', function () {

    document.querySelector("#write-toggle").onclick = openWriteContainer;
    document.querySelector("#all-posts").addEventListener("click", () => loadPosts("all-posts"));
    document.querySelector("#feeds").addEventListener("click", () => loadPosts("feeds"));
    document.querySelector("#followings").addEventListener("click", () => loadFollow("followings"));
    document.querySelector("#followers").addEventListener("click", () => loadFollow("followers"));
    document.querySelector("#liked-posts").addEventListener("click", () => loadPosts("liked"));
    document.querySelector("#profile-details").addEventListener("click", () => loadProfileDetails());

    loadPosts('all-posts');

});

const postView = document.querySelector("#post-view");
const profileView = document.querySelector("#profile-view");
const followView = document.querySelector("#follow-view");

function loadPosts(category) {
    postView.style.display = "block";
    profileView.style.display = "none";
    followView.style.display = "none";

    var header;
    if (category === "all-posts") {
        header = 'All Posts';
    } else if (category === "feeds") {
        header = 'Feeds';
    } else {
        header = 'Liked Posts';
    }

    // Get data about posts
    fetch(`/api/posts/${category}`)
        .then(response => response.json())
        .then(posts => {
            console.log(posts)

            // Clear post view
            postView.innerHTML = `<h2>${header}</h2>`;

            if (posts.length === 0) {
                var empty = document.createElement('div');
                empty.innerHTML = `
                    <h2>Very empty :(</h2>
                `;
                postView.appendChild(empty);
                return
            };

            posts.forEach((post) => {
                var dateTime = new Date(post.time);
                var postContainer = document.createElement('div');
                postContainer.className = 'single-post-container';
                postContainer.innerHTML = `
                    <div class="pic-container col-1">
                        <img class="user-pic" src="${post.pic}" alt="" />
                    </div>
                    <div class="col-11">
                        <h5 class="${post.user}-profile user-header">${post.user}</h5>
                        <p>${post.text}</p>
                        <small class="reply-btn">Reply</small>
                        <small class="post-time">${dateTime}</small>
                    </div>
                `;
                postView.appendChild(postContainer);

                // bind user profile link to username
                var profile = document.querySelectorAll(`.${post.user}-profile`);
                var profileLast = profile[profile.length - 1];
                profileLast.addEventListener('click', () => loadProfileDetails(post.user));

                // bind reply button
                var reply = document.querySelectorAll('.reply-btn');
                var replyLast = reply[reply.length - 1];
                replyLast.addEventListener('click', () => openReplyContainer(post.id));

                // show replies preview if there are any

            });
        })
}


function loadFollow(category) {
    postView.style.display = "none";
    profileView.style.display = "none";
    followView.style.display = "block";
}


function loadProfileDetails(username) {
    postView.style.display = "none";
    profileView.style.display = "block";
    followView.style.display = "none";
}


function openReplyContainer(id) {
    return
}


function openWriteContainer() {
    const writeContainer = document.querySelector(".write-form");
    const writeToggle = document.querySelector("#write-toggle");

    // Show container and hide container
    if (writeContainer.style.visibility === "hidden" |
        writeContainer.style.visibility == "") {
        writeContainer.style.visibility = "visible";
        writeContainer.style.opacity = "1";
        writeToggle.style.borderRadius = "0 0 0.25rem 0.25rem";
        writeToggle.style.borderWidth = "0 1px 1px 1px";
    } else {
        writeContainer.style.visibility = "hidden";
        writeContainer.style.opacity = "0";
        writeToggle.style.borderRadius = "0.25rem";
        writeToggle.style.borderWidth = "1px";
    }


    document.querySelector('#write-submit').addEventListener('click', () => {
        event.preventDefault();
        const text = document.querySelector('#write-post');

        if (text.value) {
            fetch('/api/write', {
                    method: 'POST',
                    body: JSON.stringify({
                        text: text.value.trim(),
                    })
                })
                .then(response => response.json())
                .then(result => {
                    console.log(result);

                    text.value = "";

                    loadPosts('all-posts');

                    if (document.querySelector('#write-alert')) {
                        document.querySelector('#write-alert').remove();
                    }
                });
        } else {
            if (!document.querySelector('#write-alert')) {
                var alert = document.createElement('span');
                alert.id = "write-alert";
                alert.textContent = "Yappies cannot be empty!";
                alert.style.color = "red";
                document.querySelector('#write-form').appendChild(alert);
            }
            return
        };


    })
}