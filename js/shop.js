
const productContainer = document.querySelector(".products-grid");

if (productContainer) {
    const params = new URLSearchParams(window.location.search);

    let selectedCategory = params.get("category") || "all";
    let searchValue = "";
    let selectedSort = "featured";
    let allProducts = [];

    const categoryMap = {
        "sneakers": ["mens-shoes", "womens-shoes", "womens-sandals"],
        "t-shirts": ["mens-shirts", "tops"],
        "pants": ["mens-pants"],
        "jackets": ["mens-shirts"],
        "accessories": ["womens-bags", "sunglasses"]
    };

    function readStorage(key) {
        try {
            const value = JSON.parse(localStorage.getItem(key));
            return Array.isArray(value) ? value : [];
        } catch {
            return [];
        }
    }

    function renderProducts(productsToRender) {
        productContainer.innerHTML = "";

        const countElement = document.querySelector(".products-header span");
        const headingElement = document.querySelector(".products-header h2");

        if (countElement) {
            countElement.textContent = `${productsToRender.length} Products`;
        }

        if (headingElement) {
            headingElement.textContent =
                selectedCategory === "all"
                    ? "All Products"
                    : selectedCategory.replace(/-/g, " ")
                        .replace(/\b\w/g, letter => letter.toUpperCase());
        }

        if (productsToRender.length === 0) {
            productContainer.innerHTML = `
                <div class="no-products">
                    <h3>No products found</h3>
                    <p>Try another search or category.</p>
                </div>
            `;
            return;
        }

        productsToRender.forEach(product => {
            const card = document.createElement("article");
            card.classList.add("product-card");

            const productImage = document.createElement("div");
            productImage.classList.add("product-image");

            const badge = document.createElement("span");
            badge.classList.add("product-badge");
            badge.textContent = "NEW";

            const wishlistButton = document.createElement("button");
            wishlistButton.classList.add("wishlist-btn");
            wishlistButton.type = "button";

            const wishlistIcon = document.createElement("i");

            function updateWishlistButton() {
                const wishlist = readStorage("wishlist");
                const isWishlisted = wishlist.includes(product.id);

                wishlistIcon.classList.toggle("fa-solid", isWishlisted);
                wishlistIcon.classList.toggle("fa-regular", !isWishlisted);
                wishlistIcon.classList.add("fa-heart");

                wishlistButton.classList.toggle("active", isWishlisted);
                wishlistButton.setAttribute("aria-pressed", String(isWishlisted));
                wishlistButton.setAttribute(
                    "aria-label",
                    isWishlisted ? "Remove from wishlist" : "Add to wishlist"
                );
            }

            wishlistButton.appendChild(wishlistIcon);
            updateWishlistButton();

            wishlistButton.addEventListener("click", event => {
                event.stopPropagation();

                const wishlist = readStorage("wishlist");
                const index = wishlist.indexOf(product.id);

                if (index === -1) {
                    wishlist.push(product.id);
                } else {
                    wishlist.splice(index, 1);
                }

                localStorage.setItem("wishlist", JSON.stringify(wishlist));
                updateWishlistButton();
            });

            const productLink = document.createElement("a");
            productLink.href = `product.html?id=${encodeURIComponent(product.id)}`;

            const image = document.createElement("img");
            image.src = product.image;
            image.alt = product.name;
            image.loading = "lazy";

            productLink.appendChild(image);
            productImage.append(badge, wishlistButton, productLink);

            const productInfo = document.createElement("div");
            productInfo.classList.add("product-info");

            const category = document.createElement("span");
            category.classList.add("product-category");
            category.textContent = product.category;

            const title = document.createElement("h3");
            title.textContent = product.name;

            const rating = document.createElement("div");
            rating.classList.add("product-rating");

            const star = document.createElement("i");
            star.classList.add("fa-solid", "fa-star");

            const ratingValue = document.createElement("span");
            ratingValue.textContent = product.rating ?? "N/A";

            rating.append(star, ratingValue);

            const productBottom = document.createElement("div");
            productBottom.classList.add("product-bottom");

            const price = document.createElement("span");
            price.classList.add("product-price");
            price.textContent = `$${Number(product.price).toFixed(2)}`;

            const addCartButton = document.createElement("button");
            addCartButton.classList.add("add-cart");
            addCartButton.type = "button";

            const cartIcon = document.createElement("i");
            cartIcon.classList.add("fa-solid", "fa-cart-shopping");

            const cartText = document.createElement("span");

            function updateCartButton() {
                const cart = readStorage("cart");
                const isInCart = cart.some(
                    item => item.productId === product.id
                );

                cartText.textContent = isInCart
                    ? "Added to Cart ✓"
                    : "Add to Cart";

                addCartButton.classList.toggle("added", isInCart);
            }

            addCartButton.append(cartIcon, cartText);
            updateCartButton();

            addCartButton.addEventListener("click", event => {
                event.stopPropagation();

                const cart = readStorage("cart");
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
                updateCartButton();
            });

            productBottom.append(price, addCartButton);
            productInfo.append(category, title, rating, productBottom);
            card.append(productImage, productInfo);
            productContainer.appendChild(card);
        });
    }

    function updateProducts() {
        let filteredProducts = [...allProducts];

        if (selectedCategory !== "all") {
            const apiCategories = categoryMap[selectedCategory] || [];

            filteredProducts = filteredProducts.filter(product =>
                apiCategories.includes(product.category)
            );
        }

        if (searchValue) {
            filteredProducts = filteredProducts.filter(product =>
                product.name.toLowerCase().includes(searchValue) ||
                product.category.toLowerCase().includes(searchValue) ||
                product.description.toLowerCase().includes(searchValue)
            );
        }

        if (selectedSort === "price-low") {
            filteredProducts.sort((a, b) => a.price - b.price);
        } else if (selectedSort === "price-high") {
            filteredProducts.sort((a, b) => b.price - a.price);
        } else if (selectedSort === "newest") {
            filteredProducts.sort((a, b) => Number(b.id.replace("api-", "")) -
                Number(a.id.replace("api-", "")));
        } else if (selectedSort === "best-selling") {
            filteredProducts.sort((a, b) => b.rating - a.rating);
        } else {
            filteredProducts.sort((a, b) => b.rating - a.rating);
        }

        renderProducts(filteredProducts);
        updateCategoryButtons();
    }

    const categoryButtons = document.querySelectorAll(".shop-button button");

    function updateCategoryButtons() {
        categoryButtons.forEach(button => {
            const buttonCategory = button.textContent.trim().toLowerCase()
                .replace(/\s+/g, "-");

            button.classList.toggle(
                "active",
                buttonCategory === selectedCategory
            );
        });
    }

    categoryButtons.forEach(button => {
        button.addEventListener("click", () => {
            selectedCategory = button.textContent.trim().toLowerCase()
                .replace(/\s+/g, "-");

            const url = new URL(window.location.href);

            if (selectedCategory === "all") {
                url.searchParams.delete("category");
            } else {
                url.searchParams.set("category", selectedCategory);
            }

            window.history.replaceState({}, "", url);
            updateProducts();
        });
    });

    const searchInput = document.getElementById("search-input");

    if (searchInput) {
        searchInput.addEventListener("input", () => {
            searchValue = searchInput.value.trim().toLowerCase();
            updateProducts();
        });
    }

    const sortSelect = document.getElementById("sort");

    if (sortSelect) {
        sortSelect.addEventListener("change", () => {
            selectedSort = sortSelect.value;
            updateProducts();
        });
    }

    window.addEventListener("storage", event => {
        if (event.key === "wishlist" || event.key === "cart") {
            updateProducts();
        }
    });

    if (window.productsReady) {
        window.productsReady.then(products => {
            allProducts = products;
            updateProducts();
        });
    } else {
        productContainer.textContent = "Unable to load products.";
        console.error("products-api.js must load before shop.js.");
    }
}
