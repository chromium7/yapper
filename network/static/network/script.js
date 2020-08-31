document.addEventListener('DOMContentLoaded', function () {

    document.querySelector("#write-toggle").onclick = openWriteContainer;
    document.querySelector('.navbar-brand').addEventListener("click", () => loadPosts("all-posts"));
    document.querySelector("#all-posts").addEventListener("click", () => loadPosts("all-posts"));
    document.querySelector("#feeds").addEventListener("click", () => loadPosts("feeds"));
    document.querySelector("#followings").addEventListener("click", () => loadFollow("followings"));
    document.querySelector("#followers").addEventListener("click", () => loadFollow("followers"));
    document.querySelector("#liked-posts").addEventListener("click", () => loadPosts("liked"));
    document.querySelector("#profile-details").addEventListener("click", () => loadProfileDetails(currentUser));

    // Load all posts as initial page
    loadPosts('all-posts');

});

// Set up views
const postView = document.querySelector("#post-view");
const profileView = document.querySelector("#profile-view");
const followView = document.querySelector("#follow-view");
const paginatorCont = document.querySelector('#paginator-container');

function loadPosts(category) {
    // Show correct the view
    postView.style.display = "block";
    profileView.style.display = "none";
    followView.style.display = "none";
    paginatorCont.innerHTML = "";

    var header;
    if (category === "all-posts") {
        header = 'All Posts';
    } else if (category === "feeds") {
        header = 'Feeds';
    } else {
        header = 'Liked Posts';
    }

    // Clear post view
    postView.innerHTML = `<h2>${header}</h2>`;

    fetch(`/api/posts/${category}`)
        .then(response => response.json())
        .then(posts => {

            if (posts.length === 0) {
                var empty = document.createElement('div');
                empty.innerHTML = `
                    <h2>Very empty :(</h2>
                `;
                postView.appendChild(empty);
                return
            };

            // Pagination
            var pagination = document.createElement('nav');
            pagination.className = "pagination-container";
            pagination.ariaLabel = "Posts navigation";
            var paginationList = document.createElement('ul');
            paginationList.className = "pagination justify-content-center";
            var paginationPrevious = document.createElement('li');
            paginationPrevious.id = "page-previous";
            paginationPrevious.className = "page-item disabled";
            paginationPrevious.innerHTML = `
                <a class="page-link" href="#">Previous</a>
            `;

            pagination.appendChild(paginationList);
            paginationList.appendChild(paginationPrevious);

            // Available pages
            var pageCount = 0;
            for (var i = 0; i < posts.length; i = i + 10) {
                pageCount++;
                const paginationItem = document.createElement('li');
                const page = pageCount;
                paginationItem.className = "page-item";
                paginationItem.innerHTML = `
                    <a class="page-link" href="#">${pageCount}</a>
                `;
                paginationList.appendChild(paginationItem);
                paginationItem.addEventListener('click', () => {
                    showPaginatorPage(category, page);
                    currentPage = page;
                });
            };

            var paginationNext = document.createElement('li');
            paginationNext.id = "page-next";
            if (pageCount > 1) {
                paginationNext.className = "page-item";
            } else {
                paginationNext.className = "page-item disabled";
            };
            paginationNext.innerHTML = `
                <a class="page-link" href="#">Next</a>
            `;
            paginationList.appendChild(paginationNext);

            // Show first page by default
            showPaginatorPage(category, 1);

            paginatorCont.appendChild(pagination);
        });
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
    paginatorCont.innerHTML = "";

    // Reset the profile view
    profileView.innerHTML = "";

    fetch(`/api/profile/${username}`)
        .then(response => response.json())
        .then(user => {
            // console.log(user);

            var profileContainer = document.createElement('div');
            profileContainer.className = "profile-container";
            profileContainer.style.background = `#333 url(${profileBg}) no-repeat`;
            profileContainer.style.backgroundSize = '100% 100%';

            var profilePic = document.createElement('div');
            profilePic.id = 'profile-img';
            profilePic.innerHTML = `
                <img src=${user.pic} class="profile-pic-big" />
            `;
            profileContainer.appendChild(profilePic);

            var profileDetails = document.createElement('div');
            profileDetails.className = "profile-details";
            profileDetails.innerHTML = `
                <div id="profile-name">
                    <h3>${user.name}</h3>
                </div>
                <div id="profile-email">
                    <h4>${user.email}</h4>
                </div>
                <div id="profile-desc"><p>${user.desc}</p></div>
            `;
            profileContainer.appendChild(profileDetails);

            if (user.name === currentUser) {
                var editProfileBtn = document.createElement('button');
                editProfileBtn.className = "edit-btn";
                editProfileBtn.textContent = "Edit Profile";
                profileContainer.appendChild(editProfileBtn);
                editProfileBtn.addEventListener('click', (event) => editProfile(event, user.name, user.desc, user.pic));
            } else {
                var followBtn = document.createElement('button');
                if (user.followed === true) {
                    followBtn.className = "unfollow-btn";
                    followBtn.textContent = "Unfollow";
                } else {
                    followBtn.className = "follow-btn";
                    followBtn.textContent = "Follow";
                }
                followBtn.addEventListener('click', (event) => followUser(event, username));
                profileDetails.appendChild(followBtn);
            }

            profileView.appendChild(profileContainer);
        });

    // SHOW POSTS FROM USER

}


function readURL(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = function (e) {
            document.querySelector('.profile-pic-big').src = e.target.result;
        };

        reader.readAsDataURL(input.files[0]);
    }
};


function editProfile(event, username, desc, pic) {
    var profileName, profileEmail, profileDesc, profileImg, imgPreview, editButton, profileDetails;
    profileName = document.querySelector('#profile-name');
    profileEmail = document.querySelector('#profile-email');
    profileDesc = document.querySelector('#profile-desc');
    profileImg = document.querySelector('#profile-img');
    imgPreview = document.querySelector('.profile-pic-big');
    editButton = event.target;
    profileDetails = profileName.parentNode;

    if (editButton.textContent === "Edit Profile") {
        editButton.textContent = "Cancel";

        // Image upload and preview
        const imgUpload = document.createElement('input');
        imgUpload.type = "file";
        imgUpload.style.margin = "auto";
        imgUpload.style.width = "160px";
        imgUpload.addEventListener('change', () => {
            readURL(imgUpload);
        });

        profileImg.appendChild(imgUpload);

        // Profile description textarea
        const descInput = document.createElement('textarea');
        descInput.textContent = desc;
        descInput.placeholder = "Tell people who you are!";
        descInput.rows = "3";
        descInput.style.width = "100%";
        descInput.style.padding = "10px";
        profileDesc.replaceChild(descInput, profileDesc.childNodes[0]);

        // Confirm edit button
        const confirmButton = document.createElement('button');
        confirmButton.className = "confirm-btn";
        confirmButton.textContent = "Make Changes";
        profileDetails.appendChild(confirmButton);

        confirmButton.addEventListener('click', () => {
            fetch(`/api/profile/${username}`, {
                    method: "POST",
                    body: JSON.stringify({
                        desc: descInput.value.trim(),
                        img: imgPreview.src,
                    })
                })
                .then(response => response.json())
                .then(results => {
                    console.log(results);

                    // Reload the page
                    location.reload();
                })
        });

    } else {
        editButton.textContent = "Edit Profile";

        // Remove img upload button
        imgPreview.src = pic;
        profileImg.removeChild(profileImg.lastChild);

        // Return profile desc 
        const descText = document.createElement('p');
        descText.textContent = desc;
        profileDesc.replaceChild(descText, profileDesc.childNodes[0]);

        // Remove confirm button
        profileDetails.removeChild(profileDetails.lastChild);
    }
}


function showPaginatorPage(category, page) {

    var header;
    if (category === "all-posts") {
        header = 'All Posts';
    } else if (category === "feeds") {
        header = 'Feeds';
    } else {
        header = 'Liked Posts';
    }

    fetch(`api/posts/${category}?page=${page}`)
        .then(response => response.json())
        .then(posts => {
            var status = posts[1];
            posts = posts[0];

            // Update previous and next pagination button functionality
            var paginationNext = document.querySelector("#page-next");
            var paginationPrevious = document.querySelector("#page-previous");
            if (status.next === true) {
                paginationNext.className = "page-item";
                paginationNext.addEventListener("click", () => showPaginatorPage(category, page + 1));
            } else {
                paginationNext.className = "page-item disabled";
                // Remove event listener
                var new_element = paginationNext.cloneNode(true);
                paginationNext.parentNode.replaceChild(new_element, paginationNext);
            }

            if (status.previous === true) {
                paginationPrevious.className = "page-item";
                paginationPrevious.addEventListener("click", () => showPaginatorPage(category, page - 1));
            } else {
                paginationPrevious.className = "page-item disabled";
                // Remove event listener
                var new_element = paginationPrevious.cloneNode(true);
                paginationPrevious.parentNode.replaceChild(new_element, paginationPrevious);
            }

            // Clear post view
            postView.innerHTML = `<h2>${header}</h2>`;

            // Create a post container for each post
            posts.forEach((post) => {
                var dateTime = new Date(post.time);

                // Determine wether the post is liked or not
                var heartFill = 'none';
                post.likes.forEach((like) => {
                    if (like === currentUser) {
                        heartFill = '#ff0000';
                    }
                });

                // Edit button
                var editButton;
                if (currentUser === post.user) {
                    editButton = `
                <button class="edit-btn" id="edit-${post.id}">Edit</button>
            `;
                } else {
                    editButton = "";
                }

                var postContainer = document.createElement('div');
                postContainer.id = `container-${post.id}`;
                postContainer.className = 'single-post-container';
                postContainer.innerHTML = `
            <div class="pic-container col-1">
                <img class="user-pic" src="${post.pic}" alt="" />
            </div>
            <div class="col-11">
                <h5 class="${post.user}-profile user-header">${post.user}</h5>
                <div id="text-${post.id}">
                    <p>${post.text}</p>
                </div>
                <svg id="heart-${post.id}" class="heart" fill="#000000" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" width="20px" height="20px">
                    <path fill=${heartFill} stroke="#ffffff" stroke-linecap="round" stroke-miterlimit="10" stroke-width="2" 
                    d="M35,8c-4.176,0-7.851,2.136-10,5.373C22.851,10.136,19.176,8,15,8C8.373,8,3,13.373,3,20c0,14,16,21,22,26c6-5,22-12,22-26C47,13.373,41.627,8,35,8z"/>
                </svg>
                <small id="heart-count-${post.id}">${post.likes.length}</small>
                <small class="reply-btn" id="reply-${post.id}">Comment</small>
                <small class="post-time">${dateTime}</small>
            </div>
            ${editButton}
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

                // Bind edit button if exist
                if (document.querySelector(`#edit-${post.id}`)) {
                    document.querySelector(`#edit-${post.id}`).addEventListener('click', () => editPost(post.id, post.text));
                };


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


function editPost(id, text) {
    const editButton = document.querySelector(`#edit-${id}`);
    const textContainer = document.querySelector(`#text-${id}`);

    if (editButton.textContent === "Edit") {
        editButton.textContent = "Cancel";
        textContainer.innerHTML = "";

        const textArea = document.createElement('textarea');
        textArea.textContent = text;
        textArea.className = "edit-area";
        textArea.rows = 3;
        textContainer.appendChild(textArea);

        // Confirm edit button
        const confirmButton = document.createElement('button');
        confirmButton.className = "confirm-btn";
        confirmButton.textContent = "Edit";
        textContainer.appendChild(confirmButton);

        // Delete post button
        const deleteButton = document.createElement('button');
        deleteButton.className = "delete-btn";
        deleteButton.textContent = "Remove post";
        textContainer.appendChild(deleteButton);


        // Bind function
        confirmButton.addEventListener('click', () => {
            fetch(`/api/edit/${id}`, {
                    method: "POST",
                    body: JSON.stringify({
                        text: textArea.value.trim()
                    })
                })
                .then(response => response.json())
                .then(result => {
                    console.log(result);

                    editButton.textContent = "Edit";
                    textContainer.innerHTML = `
                    <p>${textArea.value.trim()}</p>
                    `;
                })
        });

        deleteButton.addEventListener('click', () => {
            fetch(`/api/edit/${id}`, {
                    method: "PUT"
                })
                .then(
                    textContainer.parentNode.parentNode.remove()
                )
        });

    } else {
        editButton.textContent = "Edit";
        textContainer.innerHTML = `
        <p>${text}</p>
        `;
    }
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


function displayComments(comment, parentContainer) {
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
    if (writeContainer.style.display === "none" | writeContainer.style.display === "") {
        writeContainer.style.display = "block";
        writeToggle.style.borderRadius = "0 0 0.25rem 0.25rem";
        writeToggle.style.borderWidth = "0 1px 1px 1px";
    } else {
        writeContainer.style.display = "none";
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