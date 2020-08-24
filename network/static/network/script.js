document.addEventListener('DOMContentLoaded', function () {

    document.querySelector("#write-toggle").onclick = openWriteContainer;
    document.querySelector("#all-posts").addEventListener("click", () => loadPosts("all-posts"));
    document.querySelector("#feeds").addEventListener("click", () => loadPosts("feeds"));
    document.querySelector("#followings").addEventListener("click", () => loadFollow("followings"));
    document.querySelector("#followers").addEventListener("click", () => loadFollow("followers"));
    document.querySelector("#liked-posts").addEventListener("click", loadPosts("liked"));
    document.querySelector("#profile-details").addEventListener("click", loadProfileDetails);

});

const postView = document.querySelector("#post-view");
const profileView = document.querySelector("#profile-view");
const followView = document.querySelector("#follow-view");

function loadPosts(category) {
    postView.style.display = "block";
    profileView.style.display = "none";
    followView.style.display = "none";
}


function loadFollow(category) {
    postView.style.display = "none";
    profileView.style.display = "none";
    followView.style.display = "block";
}


function loadProfileDetails() {
    postView.style.display = "none";
    profileView.style.display = "block";
    followView.style.display = "none";
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
}