document.addEventListener('DOMContentLoaded', () => {
    document.querySelector("#write-toggle").addEventListener("click", openWriteContainer)
});

// function test() {
//     document.querySelector("#write-toggle").addEventListener("click", openWriteContainer());
// };

function openWriteContainer() {
    const writeContainer = document.querySelector(".write-form");
    const writeToggle = document.querySelector("#write-toggle");

    if (writeContainer.style.display === "none") {
        writeContainer.style.display = "block";
        writeToggle.style.borderRadius = "0 0 0.25rem 0.25rem";
        writeToggle.style.borderWidth = "0 1px 1px 1px";
    } else {
        writeContainer.style.display = "none";
        writeToggle.style.borderRadius = "0.25rem";
        writeToggle.style.borderWidth = "1px";
    }


}