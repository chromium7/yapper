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
                postContainer.id = `container-${post.id}`
                postContainer.className = 'single-post-container';
                postContainer.innerHTML = `
                    <div class="pic-container col-1">
                        <img class="user-pic" src="${post.pic}" alt="" />
                    </div>
                    <div class="col-11">
                        <h5 class="${post.user}-profile user-header">${post.user}</h5>
                        <p>${post.text}</p>
                        <small class="reply-btn" id="reply-${post.id}">Reply</small>
                        <small class="post-time">${dateTime}</small>
                    </div>
                `;
                postView.appendChild(postContainer);

                // bind user profile link to username
                var profile = document.querySelectorAll(`.${post.user}-profile`);
                var profileLast = profile[profile.length - 1];
                profileLast.addEventListener('click', () => loadProfileDetails(post.user));

                // bind reply button
                var reply = document.querySelector(`#reply-${post.id}`);
                reply.addEventListener('click', () => openReplyContainer(post.id));

                // show replies preview if there are any
                fetch(`api/replies/${post.id}`)
                    .then(response => response.json())
                    .then(replies => {
                        if (replies.length === 0) {
                            return
                        } else if (replies.length > 1) {
                            var showMoreButton = `
                            <div>
                                <small class="show-more-btn">Show more replies</small>
                            </div>
                            `
                        } else {
                            var showMoreButton = "";
                        };

                        const replyPreview = replies[0];
                        const replyPreviewTime = new Date(replyPreview.time)
                        var replyPreviewContainer = document.createElement("div");
                        replyPreviewContainer.id = `reply-container-${post.id}`;
                        replyPreviewContainer.innerHTML = `
                        <div class="reply-container">
                            <div class="reply-bullet"> > </div>
                            <div>
                                <span class="user-header">${replyPreview.user}</span> replied on 
                                <small class="post-time">${replyPreviewTime}:</small>
                                <div>${replyPreview.text}</div>
                                ${showMoreButton}
                            </div>
                        </div>
                    `;

                        postContainer.parentNode.insertBefore(replyPreviewContainer, postContainer.nextSibling);

                    });
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

    var postContainer = document.querySelector(`#container-${id}`);
    var postReply = document.querySelector(`#reply-${id}`);

    if (document.querySelector('.reply-form')) {
        var existingForm = document.querySelector('.reply-form');
        var oldId = existingForm.id.split('-')[2];
        if (oldId == id) {
            postReply.textContent = "Reply";
            existingForm.remove();
            return
        } else {
            document.querySelector(`#reply-${oldId}`).textContent = "Reply";
            existingForm.remove();
        }
    }
    postReply.textContent = "Hide";
    var replyForm = document.createElement('div');
    replyForm.id = `reply-form-${id}`;
    replyForm.className = 'reply-form';
    replyForm.innerHTML = `
    <textarea id='reply-text' class='form-control' cols='70' rows='2' maxlength='300' placeholder='Enter reply here'></textarea>
    <button id='reply-btn' class='reply-btn'>Reply</button>
    `;
    postContainer.appendChild(replyForm);

    document.querySelector('#reply-btn').addEventListener('click', () => {
        const replyText = document.querySelector('#reply-text');

        if (replyText.value) {
            fetch(`/api/replies/${id}`, {
                    method: "POST",
                    body: JSON.stringify({
                        text: replyText.value.trim()
                    })
                })
                .then(response => response.json())
                .then(result => {
                    console.log(result);

                    replyForm.remove()
                })
        } else {
            replyText.style.border = "2px solid red";
            replyText.focus();
            var replyAlert = document.createElement('span');
            replyAlert.id = 'reply-alert';
            replyAlert.textContent = "Reply cannot be empty";
            replyAlert.style.color = "red";
            replyForm.appendChild(replyAlert);
            return
        }
    })
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
        event.stopImmediatePropagation()
    })
}