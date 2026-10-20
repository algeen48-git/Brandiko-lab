
const params = new URLSearchParams(window.location.search);
const productId = params.get("id");

const productTitle = document.querySelector(".product-details-info h2");
const headerTitle = document.querySelector(".product-details-header h1");
const headerDescription = document.querySelector(".product-details-header p");
const productCategory = document.querySelector(".product-details-category");
const productDescription = document.querySelector(".product-description");
const productPrice = document.querySelector(".product-details-price");
const productImage = document.querySelector(".main-product-image img");
const productRating = document.querySelector(".product-details-rating span");
const thumbnailsContainer = document.querySelector(".product-thumbnails");
const relatedGrid = document.querySelector(".related-grid");
const quantityValue = document.querySelector(".quantity-control span");
const addCartButton = document.querySelector(".add-to-cart-details");
const wishlistButton = document.querySelector(".wishlist-details");

let currentProduct = null;
let selectedSize = document.querySelector(".size-btn.active")?.textContent.trim() || "41";
let quantity = 1;

function readStorage(key) {
    try {
        const value = JSON.parse(localStorage.getItem(key));
        return Array.isArray(value) ? value : [];
    } catch {
        return [];
    }
}

function saveStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function updateWishlistButton() {
    if (!currentProduct || !wishlistButton) return;

    const wishlist = readStorage("wishlist");
    const isLiked = wishlist.includes(currentProduct.id);
    const icon = wishlistButton.querySelector("i");

    if (icon) {
        icon.classList.toggle("fa-solid", isLiked);
        icon.classList.toggle("fa-regular", !isLiked);
    }

    wishlistButton.classList.toggle("active", isLiked);
    wishlistButton.setAttribute("aria-pressed", String(isLiked));
}

function updateCartButton() {
    if (!currentProduct || !addCartButton) return;

    const cart = readStorage("cart");
    const isInCart = cart.some(item => item.productId === currentProduct.id);

    addCartButton.innerHTML = isInCart
        ? '<i class="fa-solid fa-check"></i> Added to Cart ✓'
        : '<i class="fa-solid fa-cart-shopping"></i> Add to Cart';

    addCartButton.classList.toggle("added", isInCart);
}

function renderThumbnails(product) {
    if (!thumbnailsContainer) return;

    const images = [...new Set([
        product.image,
        ...(product.images || [])
    ].filter(Boolean))].slice(0, 5);

    thumbnailsContainer.innerHTML = "";

    images.forEach((image, index) => {
        const button = document.createElement("button");
        button.className = `thumbnail${index === 0 ? " active" : ""}`;
        button.type = "button";
        button.setAttribute("aria-label", `View product image ${index + 1}`);

        const img = document.createElement("img");
        img.src = image;
        img.alt = `${product.name} view ${index + 1}`;

        button.appendChild(img);
        thumbnailsContainer.appendChild(button);
    });
}

function renderProduct(product) {
    currentProduct = product;

    if (headerTitle) headerTitle.textContent = product.name;
    if (productTitle) productTitle.textContent = product.name;
    if (productCategory) productCategory.textContent = product.category;
    if (productDescription) productDescription.textContent = product.description;
    if (productPrice) productPrice.textContent = `$${product.price.toFixed(2)}`;

    if (headerDescription) {
        headerDescription.textContent = product.description;
    }

    if (productImage) {
        productImage.src = product.image;
        productImage.alt = product.name;
    }

    if (productRating) {
        productRating.textContent = `${product.rating ?? "N/A"} / 5`;
    }

    renderThumbnails(product);
    renderRelatedProducts(product);
    updateCartButton();
    updateWishlistButton();
}

function renderRelatedProducts(product) {
    if (!relatedGrid || !window.externalProducts) return;

    const related = window.externalProducts
        .filter(item => item.id !== product.id)
        .sort((a, b) => {
            const sameCategoryA = a.category === product.category ? 1 : 0;
            const sameCategoryB = b.category === product.category ? 1 : 0;

            return sameCategoryB - sameCategoryA;
        })
        .slice(0, 4);

    relatedGrid.innerHTML = "";

    related.forEach(item => {
        const card = document.createElement("article");
        card.className = "related-card";

        card.innerHTML = `
            <div class="related-image">
                <button class="related-wishlist" type="button"
                    aria-label="Add ${escapeHTML(item.name)} to wishlist"
                    aria-pressed="false">
                    <i class="fa-regular fa-heart"></i>
                </button>
                <img src="${escapeHTML(item.image)}" alt="${escapeHTML(item.name)}">
            </div>
            <div class="related-info">
                <span>${escapeHTML(item.category)}</span>
                <h3>${escapeHTML(item.name)}</h3>
                <div class="related-bottom">
                    <strong>$${item.price.toFixed(2)}</strong>
                    <button class="add-cart" type="button">
                        <i class="fa-solid fa-cart-shopping"></i>
                        <span>Add to Cart</span>
                    </button>
                </div>
            </div>
        `;

        card.addEventListener("click", event => {
            if (event.target.closest("button")) return;
            window.location.href = `product.html?id=${encodeURIComponent(item.id)}`;
        });

        card.querySelector(".related-wishlist").addEventListener("click", event => {
            event.stopPropagation();

            const wishlist = readStorage("wishlist");
            const index = wishlist.indexOf(item.id);

            if (index === -1) wishlist.push(item.id);
            else wishlist.splice(index, 1);

            saveStorage("wishlist", wishlist);
            updateRelatedWishlistButton(card, item.id);
        });

        card.querySelector(".add-cart").addEventListener("click", event => {
            event.stopPropagation();

            const cart = readStorage("cart");
            const existing = cart.find(cartItem => cartItem.productId === item.id);

            if (existing) {
                existing.quantity += 1;
            } else {
                cart.push({ productId: item.id, quantity: 1 });
            }

            saveStorage("cart", cart);

            const button = card.querySelector(".add-cart span");
            button.textContent = "Added ✓";
        });

        relatedGrid.appendChild(card);
        updateRelatedWishlistButton(card, item.id);
    });
}

function updateRelatedWishlistButton(card, productId) {
    const button = card.querySelector(".related-wishlist");
    const icon = button?.querySelector("i");
    if (!button || !icon) return;

    const isLiked = readStorage("wishlist").includes(productId);

    icon.classList.toggle("fa-solid", isLiked);
    icon.classList.toggle("fa-regular", !isLiked);
    button.setAttribute("aria-pressed", String(isLiked));
}

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

// Change the main image when a thumbnail is selected.
thumbnailsContainer?.addEventListener("click", event => {
    const button = event.target.closest(".thumbnail");
    if (!button || !productImage) return;

    thumbnailsContainer.querySelectorAll(".thumbnail").forEach(item => {
        item.classList.toggle("active", item === button);
    });

    const image = button.querySelector("img");
    if (image) {
        productImage.src = image.src;
        productImage.alt = image.alt;
    }
});

// Size selection.
document.querySelectorAll(".size-btn").forEach(button => {
    button.addEventListener("click", () => {
        document.querySelectorAll(".size-btn").forEach(item => {
            item.classList.toggle("active", item === button);
        });

        selectedSize = button.textContent.trim();
    });
});

// Quantity controls.
document.querySelectorAll(".quantity-btn").forEach(button => {
    button.addEventListener("click", () => {
        if (button.querySelector(".fa-plus")) {
            quantity += 1;
        } else if (button.querySelector(".fa-minus") && quantity > 1) {
            quantity -= 1;
        }

        if (quantityValue) quantityValue.textContent = quantity;
    });
});

// Add product to cart.
addCartButton?.addEventListener("click", () => {
    if (!currentProduct) return;

    const cart = readStorage("cart");
    const existing = cart.find(item => item.productId === currentProduct.id);

    if (existing) {
        existing.quantity += quantity;
    } else {
        cart.push({
            productId: currentProduct.id,
            quantity,
            size: selectedSize
        });
    }

    saveStorage("cart", cart);
    updateCartButton();
});

// Toggle wishlist.
wishlistButton?.addEventListener("click", () => {
    if (!currentProduct) return;

    const wishlist = readStorage("wishlist");
    const index = wishlist.indexOf(currentProduct.id);

    if (index === -1) wishlist.push(currentProduct.id);
    else wishlist.splice(index, 1);

    saveStorage("wishlist", wishlist);
    updateWishlistButton();
});

// Load the requested product from the API data.
window.productsReady.then(products => {
    const product = products.find(item => item.id === productId);

    if (!product) {
        document.querySelector(".product-details").innerHTML =
            "<p>Product not found. Please return to the shop and choose a product.</p>";

        if (relatedGrid) relatedGrid.innerHTML = "";
        return;
    }

    renderProduct(product);
}).catch(error => {
    console.error("Unable to load product:", error);

    document.querySelector(".product-details").innerHTML =
        "<p>Unable to load this product. Please try again later.</p>";
});

// Refresh button states when returning to the page.
window.addEventListener("pageshow", () => {
    updateCartButton();
    updateWishlistButton();
});

window.addEventListener("storage", () => {
    updateCartButton();
    updateWishlistButton();
});
