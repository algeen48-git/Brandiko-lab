
const currentPage = window.location.pathname
    .split("/")
    .pop()
    .toLowerCase() || "index.html";

const pageAliases = {
    "product-details.html": "shop.html",
    "cart.html": "shop.html",
    "wishlist.html": "shop.html"
};

const activePage = pageAliases[currentPage] || currentPage;

const navLinks = document.querySelectorAll(
    ".header .navbar ul li a"
);

navLinks.forEach(function (link) {
    const linkPage = link.getAttribute("href")
        .split("/")
        .pop()
        .toLowerCase();

    const isActive = linkPage === activePage;

    link.classList.toggle("active", isActive);

    if (isActive) {
        link.setAttribute("aria-current", "page");
    } else {
        link.removeAttribute("aria-current");
    }
});
