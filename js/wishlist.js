
const wishlistContainer = document.querySelector(".wishlist-products");

if (wishlistContainer) {
    const readStorage = key => {
        try {
            const value = JSON.parse(localStorage.getItem(key));
            return Array.isArray(value) ? value : [];
        } catch {
            return [];
        }
    };

    const saveStorage = (key, value) => {
        localStorage.setItem(key, JSON.stringify(value));
    };

    const escapeHTML = value =>
        String(value ?? "").replace(/[&<>"']/g, char => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[char]);

    const renderWishlist = products => {
        const wishlist = readStorage("wishlist");

        const wishlistProducts = products.filter(product =>
            wishlist.includes(product.id)
        );

        wishlistContainer.innerHTML = "";

        if (wishlistProducts.length === 0) {
            wishlistContainer.innerHTML = `
                <div class="empty-wishlist">
                    <i class="fa-regular fa-heart"></i>
                    <h3>Your wishlist is empty</h3>
                    <p>You haven't saved any products yet.</p>
                    <a href="shop.html" class="continue-shopping">
                        Explore Products
                    </a>
                </div>
            `;
            return;
        }

        wishlistProducts.forEach(product => {
            const card = document.createElement("article");
            card.className = "wishlist-card";

            card.innerHTML = `
                <div class="wishlist-image">
                    <button
                        class="wishlist-remove"
                        data-product-id="${escapeHTML(product.id)}"
                        type="button"
                        aria-label="Remove ${escapeHTML(product.name)} from wishlist"
                    >
                        <i class="fa-solid fa-heart"></i>
                    </button>

                    <a href="product.html?id=${encodeURIComponent(product.id)}">
                        <img
                            src="${escapeHTML(product.image)}"
                            alt="${escapeHTML(product.name)}"
                        >
                    </a>
                </div>

                <div class="wishlist-info">
                    <span class="wishlist-category">
                        ${escapeHTML(product.category)}
                    </span>

                    <a href="product.html?id=${encodeURIComponent(product.id)}">
                        <h3>${escapeHTML(product.name)}</h3>
                    </a>

                    <div class="wishlist-rating">
                        <i class="fa-solid fa-star"></i>
                        <span>${product.rating ?? "N/A"}</span>
                    </div>

                    <div class="wishlist-bottom">
                        <span class="wishlist-price">
                            $${Number(product.price).toFixed(2)}
                        </span>

                        <button
                            class="wishlist-add-cart"
                            data-product-id="${escapeHTML(product.id)}"
                            type="button"
                        >
                            <i class="fa-solid fa-cart-shopping"></i>
                            <span>Add to Cart</span>
                        </button>
                    </div>
                </div>
            `;

            wishlistContainer.appendChild(card);

            const addButton = card.querySelector(".wishlist-add-cart");
            const cart = readStorage("cart");

            if (cart.some(item => item.productId === product.id)) {
                addButton.classList.add("added");
                addButton.innerHTML = `
                    <i class="fa-solid fa-check"></i>
                    <span>Added to Cart</span>
                `;
                addButton.disabled = true;
            }
        });
    };

    const removeFromWishlist = productId => {
        const wishlist = readStorage("wishlist");

        saveStorage(
            "wishlist",
            wishlist.filter(id => id !== productId)
        );
    };

    wishlistContainer.addEventListener("click", event => {
        const removeButton = event.target.closest(".wishlist-remove");
        const addButton = event.target.closest(".wishlist-add-cart");

        if (removeButton) {
            removeFromWishlist(removeButton.dataset.productId);
            window.productsReady.then(renderWishlist);
            return;
        }

        if (addButton) {
            const productId = addButton.dataset.productId;

            window.productsReady.then(products => {
                const product = products.find(item => item.id === productId);
                if (!product) return;

                const cart = readStorage("cart");
                const existingItem = cart.find(
                    item => item.productId === product.id
                );

                if (existingItem) {
                    existingItem.quantity =
                        (Number(existingItem.quantity) || 1) + 1;
                } else {
                    cart.push({
                        productId: product.id,
                        quantity: 1
                    });
                }

                saveStorage("cart", cart);

                addButton.classList.add("added");
                addButton.innerHTML = `
                    <i class="fa-solid fa-check"></i>
                    <span>Added to Cart</span>
                `;
                addButton.disabled = true;
            });
        }
    });

    if (window.productsReady) {
        window.productsReady
            .then(renderWishlist)
            .catch(error => {
                console.error("Unable to load wishlist:", error);
                wishlistContainer.textContent =
                    "Unable to load your wishlist. Please refresh the page.";
            });
    }

    window.addEventListener("storage", event => {
        if (event.key === "wishlist" || event.key === "cart") {
            window.productsReady.then(renderWishlist);
        }
    });
}
