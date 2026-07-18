const profileBtn = document.getElementById("profile-btn");
const dropdown = document.getElementById("dropdown");

profileBtn.addEventListener("click", () => {
    dropdown.classList.toggle("show");
});

window.addEventListener("click", (event) => {
    if (!event.target.matches("#profile-btn")) {
        dropdown.classList.remove("show");
    }
});