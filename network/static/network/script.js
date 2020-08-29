document.addEventListener('DOMContentLoaded', function () {

    document.querySelector("#write-toggle").onclick = openWriteContainer;
    document.querySelector("#all-posts").addEventListener("click", () => loadPosts("all-posts"));
    document.querySelector("#feeds").addEventListener("click", () => loadPosts("feeds"));
    document.querySelector("#followings").addEventListener("click", () => loadFollow("followings"));
    document.querySelector("#followers").addEventListener("click", () => loadFollow("followers"));
    document.querySelector("#liked-posts").addEventListener("click", () => loadPosts("liked"));
    document.querySelector("#profile-details").addEventListener("click", () => loadProfileDetails());

    // Load all posts as initial page
    loadPosts('all-posts');

});

// Set up views
const postView = document.querySelector("#post-view");
const profileView = document.querySelector("#profile-view");
const followView = document.querySelector("#follow-view");


function loadPosts(category) {
    // Show correct the view
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
            // console.log(posts);

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

            // Create a post container for each post
            posts.forEach((post) => {
                var dateTime = new Date(post.time);

                // console.log(post.likes);

                // Determine wether the post is liked or not
                var heartFill = 'none';
                post.likes.forEach((like) => {
                    if (like === currentUser) {
                        heartFill = '#ff0000';
                    }
                });
                var postContainer = document.createElement('div');
                postContainer.id = `container-${post.id}`;
                postContainer.className = 'single-post-container';
                postContainer.innerHTML = `
                    <div class="pic-container col-1">
                        <img class="user-pic" src="${post.pic}" alt="" />
                    </div>
                    <div class="col-11">
                        <h5 class="${post.user}-profile user-header">${post.user}</h5>
                        <p>${post.text}</p>
                        <svg id="heart-${post.id}" class="heart" fill="#000000" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" width="20px" height="20px">
                            <path fill=${heartFill} stroke="#ffffff" stroke-linecap="round" stroke-miterlimit="10" stroke-width="2" 
                            d="M35,8c-4.176,0-7.851,2.136-10,5.373C22.851,10.136,19.176,8,15,8C8.373,8,3,13.373,3,20c0,14,16,21,22,26c6-5,22-12,22-26C47,13.373,41.627,8,35,8z"/>
                        </svg>
                        <small id="heart-count-${post.id}">${post.likes.length}</small>
                        <small class="reply-btn" id="reply-${post.id}">Comment</small>
                        <small class="post-time">${dateTime}</small>
                    </div>
                `;
                postView.appendChild(postContainer);

                // Bind user profile link to username
                var profile = document.querySelectorAll(`.${post.user}-profile`);
                var profileLast = profile[profile.length - 1];
                profileLast.addEventListener('click', () => loadProfileDetails(post.user));

                // Bind heart button 
                var heart = document.querySelector(`#heart-${post.id}`);
                heart.addEventListener('click', event => heartPost(event, post.id));

                // Bind reply button
                var reply = document.querySelector(`#reply-${post.id}`);
                reply.addEventListener('click', () => openReplyContainer(post.id, category));

                // Show replies preview if there is any
                fetch(`api/replies/${post.id}`)
                    .then(response => response.json())
                    .then(replies => {
                        // If no replies, return immediately
                        if (replies.length === 0) {
                            return
                        };

                        // Create show button
                        var showComments = document.createElement('small');
                        showComments.id = `show-more-${post.id}`;
                        showComments.className = 'show-more-btn';
                        showComments.textContent = 'Show comments';
                        reply.parentNode.insertBefore(showComments, reply.nextSibling);

                        // Bind functions
                        var replyContainer = document.createElement('div');
                        showComments.addEventListener('click', () => {
                            if (showComments.textContent === "Show comments") {
                                showComments.textContent = "Hide comments";
                                replies.forEach(reply => {
                                    postContainer.parentNode.insertBefore(replyContainer, postContainer.nextSibling);
                                    displayComments(reply, replyContainer);
                                })
                            } else {
                                showComments.textContent = "Show comments";
                                replyContainer.innerHTML = "";
                            }
                        })
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

function heartPost(event, id) {
    fetch(`api/heart/${id}`, {
            method: "PUT"
        })
        .then(response => response.json())
        .then(result => {
            // Change the heart icon fill
            if (result.message === "liked") {
                const target = event.target.childNodes;
                target[1].style.fill = "#ff0000";
            } else {
                const target = event.target;
                target.style.fill = "None";
            }
            document.querySelector(`#heart-count-${id}`).textContent = result.count;
        });
}


function displayComments(comment, parentContainer, preview = false) {
    // If preview comment, add show more button
    if (preview === true) {
        var showMoreButton = `
        <div>
            <small id="show-more-${comment.id}" class="show-more-btn">Show more comments</small>
        </div>
        `
    } else {
        var showMoreButton = "";
    };
    const time = new Date(comment.time);
    const commentContainer = document.createElement("div");
    commentContainer.id = `reply-container-${comment.id}`;
    commentContainer.innerHTML = `
        <div class="reply-container">
            <div class="reply-bullet"> > </div>
            <div>
                <span class="${comment.user}-profile user-header">${comment.user}</span> 
                commented on 
                <small class="post-time">${time}:</small>
                <div>${comment.text}</div>
                ${showMoreButton}
            </div>
        </div>
    `;

    parentContainer.appendChild(commentContainer);

    // Bind functions
    profile = document.querySelectorAll(`.${comment.user}-profile`);
    profileLast = profile[profile.length - 1];
    profileLast.addEventListener('click', () => loadProfileDetails(comment.user));
}


function openReplyContainer(id, category) {

    var postContainer = document.querySelector(`#container-${id}`);
    var postReply = document.querySelector(`#reply-${id}`);

    // Close reply container if opened
    if (document.querySelector('.reply-form')) {
        var existingForm = document.querySelector('.reply-form');
        var oldId = existingForm.id.split('-')[2];
        if (oldId == id) {
            postReply.textContent = "Comment";
            existingForm.remove();
            return
        } else {
            document.querySelector(`#reply-${oldId}`).textContent = "Comment";
            existingForm.remove();
        }
    }

    // Change value to hide
    postReply.textContent = "Hide";

    // Reply form area
    var replyForm = document.createElement('div');
    replyForm.id = `reply-form-${id}`;
    replyForm.className = 'reply-form';
    replyForm.innerHTML = `
    <textarea id='reply-text' class='form-control' cols='70' rows='2' maxlength='300' placeholder='Enter reply here'></textarea>
    <button id='reply-btn' class='reply-btn'>Comment</button>
    `;
    postContainer.appendChild(replyForm);

    // Bind function
    document.querySelector('#reply-btn').addEventListener('click', () => {
        const replyText = document.querySelector('#reply-text');

        if (replyText.value) {
            // Send post request if text is not empty
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
                    loadPosts(category);
                })
        } else {
            // Show alert if text is empty
            replyText.style.border = "2px solid red";
            replyText.focus();
            var replyAlert = document.createElement('span');
            replyAlert.id = 'reply-alert';
            replyAlert.textContent = "Comment cannot be empty";
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

    // Bind functions
    document.querySelector('#write-submit').addEventListener('click', () => {
        event.preventDefault();
        const text = document.querySelector('#write-post');

        if (text.value) {
            // Send post request if text is not empty
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
            // Show alert if there is not an alert yet
            if (!document.querySelector('#write-alert')) {
                var alert = document.createElement('span');
                alert.id = "write-alert";
                alert.textContent = "Yappies cannot be empty!";
                alert.style.color = "red";
                document.querySelector('#write-form').appendChild(alert);
            }
            return
        };
        // Prevent multiple posts
        event.stopImmediatePropagation()
    })
}