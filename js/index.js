
const productContainer = document.querySelector(
    ".featured-products .product-container"
);

function getWishlist() {
    try {
        const wishlist = JSON.parse(localStorage.getItem("wishlist"));
        return Array.isArray(wishlist) ? wishlist : [];
    } catch {
        return [];
    }
}

function getCart() {
    try {
        const cart = JSON.parse(localStorage.getItem("cart"));
        return Array.isArray(cart) ? cart : [];
    } catch {
        return [];
    }
}

function createProductCard(product) {
    const card = document.createElement("div");
    card.classList.add("product-card");
    card.dataset.productId = product.id;
    card.setAttribute("role", "link");
    card.setAttribute("tabindex", "0");
    card.setAttribute("aria-label", `View details for ${product.name}`);

    const image = document.createElement("img");
    image.src = product.image;
    image.alt = product.name;
    image.loading = "lazy";

    const title = document.createElement("h3");
    title.textContent = product.name;

    const description = document.createElement("p");
    description.textContent = product.description;

    const price = document.createElement("span");
    price.classList.add("price");
    price.textContent = `$${product.price}`;

    // Wishlist button
    const wishlistButton = document.createElement("button");
    wishlistButton.type = "button";
    wishlistButton.classList.add("wishlist-btn");
    wishlistButton.setAttribute(
        "aria-label",
        `Toggle wishlist for ${product.name}`
    );

    const heartIcon = document.createElement("i");
    wishlistButton.appendChild(heartIcon);

    function updateWishlistButton() {
        const isFavorite = getWishlist().includes(product.id);

        heartIcon.classList.toggle("fa-solid", isFavorite);
        heartIcon.classList.toggle("fa-regular", !isFavorite);
        heartIcon.classList.add("fa-heart");

        wishlistButton.classList.toggle("active", isFavorite);
        wishlistButton.setAttribute("aria-pressed", String(isFavorite));
    }

    updateWishlistButton();

    wishlistButton.addEventListener("click", event => {
        event.stopPropagation();

        const wishlist = getWishlist();
        const isFavorite = wishlist.includes(product.id);

        const updatedWishlist = isFavorite
            ? wishlist.filter(id => id !== product.id)
            : [...wishlist, product.id];

        localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));
        updateWishlistButton();
    });

    // Add to Cart button
    const cartButton = document.createElement("button");
    cartButton.type = "button";
    cartButton.classList.add("add-to-cart");

    const cartIcon = document.createElement("i");
    cartIcon.classList.add("fa-solid", "fa-cart-plus");

    const buttonText = document.createElement("span");
    buttonText.textContent = "Add to Cart";

    cartButton.append(cartIcon, buttonText);

    cartButton.addEventListener("click", event => {
        event.stopPropagation();

        const cart = getCart();

        const existingItem = cart.find(
            item => item.productId === product.id
        );

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                productId: product.id,
                quantity: 1
            });
        }

        localStorage.setItem("cart", JSON.stringify(cart));

        buttonText.textContent = "Added to Cart";
        cartButton.classList.add("added");
    });

    // Product details
    function openProductDetails() {
        window.location.href =
            `product.html?id=${encodeURIComponent(product.id)}`;
    }

    card.addEventListener("click", openProductDetails);

    card.addEventListener("keydown", event => {
        if (
            event.target === card &&
            (event.key === "Enter" || event.key === " ")
        ) {
            event.preventDefault();
            openProductDetails();
        }
    });

    card.append(
        image,
        title,
        description,
        price,
        wishlistButton,
        cartButton
    );

    return card;
}

function renderTrendingProducts(products) {
    if (!productContainer) {
        console.error("Trending Products container not found.");
        return;
    }

    productContainer.innerHTML = "";

    if (!products.length) {
        productContainer.textContent = "No products available.";
        return;
    }

    const trendingProducts = [...products]
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 8);

    trendingProducts.forEach(product => {
        productContainer.appendChild(createProductCard(product));
    });
}

if (window.productsReady) {
    window.productsReady.then(products => {
        renderTrendingProducts(products);
    });
} else {
    console.error("products-api.js must load before index.js.");
}
