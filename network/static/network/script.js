document.addEventListener('DOMContentLoaded', () => {

    document.querySelector("#write-toggle").addEventListener("click", openWriteContainer);

});



function openWriteContainer() {
    const writeContainer = document.querySelector(".write-form");
    const writeToggle = document.querySelector("#write-toggle");

    // Show container and hide container
    if (writeContainer.style.visibility === "hidden") {
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