const menuToggle = document.querySelector(".menu-toggle");
const header = document.querySelector(".header");

menuToggle.addEventListener("click", () => {
    header.classList.toggle("menu-open");
});
