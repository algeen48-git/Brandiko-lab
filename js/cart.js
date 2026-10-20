
const cartContainer = document.querySelector(".cart-items");

if (cartContainer) {
    let cart = [];

    try {
        const savedCart = JSON.parse(localStorage.getItem("cart"));
        cart = Array.isArray(savedCart) ? savedCart : [];
    } catch {
        cart = [];
    }

    let cartProducts = [];

    const showEmptyCart = () => {
        cartContainer.innerHTML = "";

        const emptyCart = document.createElement("div");
        emptyCart.classList.add("empty-cart");

        const heading = document.createElement("h2");
        heading.textContent = "Your cart is empty.";

        const message = document.createElement("p");
        message.textContent = "Looks like you haven't added anything yet.";

        const link = document.createElement("a");
        link.href = "shop.html";
        link.classList.add("continue-shopping");
        link.textContent = "Continue Shopping";

        emptyCart.append(heading, message, link);
        cartContainer.appendChild(emptyCart);
    };

    const updateSummary = () => {
        const summaryRows = document.querySelectorAll(".summary-row");
        const summaryTotal = document.querySelector(".summary-total");

        const subtotalValue = summaryRows[0]?.querySelectorAll("span")[1];
        const shippingValue = summaryRows[1]?.querySelectorAll("span")[1];
        const totalValue = summaryTotal?.querySelectorAll("span")[1];

        const subtotal = cartProducts.reduce(
            (total, item) => total + item.price * item.quantity,
            0
        );

        const shippingCost = cartProducts.length > 0 ? 5 : 0;

        if (subtotalValue) {
            subtotalValue.textContent = `$${subtotal.toFixed(2)}`;
        }

        if (shippingValue) {
            shippingValue.textContent = `$${shippingCost.toFixed(2)}`;
        }

        if (totalValue) {
            totalValue.textContent = `$${(subtotal + shippingCost).toFixed(2)}`;
        }
    };

    const saveCart = () => {
        localStorage.setItem("cart", JSON.stringify(cart));
    };

    const syncCartProducts = products => {
        const productsById = new Map(
            products.map(product => [String(product.id), product])
        );

        cart = cart
            .filter(item => productsById.has(String(item.productId)))
            .map(item => ({
                ...item,
                productId: String(item.productId),
                quantity: Math.max(1, Number(item.quantity) || 1)
            }));

        saveCart();

        cartProducts = cart.map(item => {
            const product = productsById.get(item.productId);

            return {
                productId: item.productId,
                quantity: item.quantity,
                name: product.name,
                category: product.category,
                price: Number(product.price) || 0,
                image: product.image
            };
        });
    };

    const renderCart = () => {
        cartContainer.innerHTML = "";

        if (cartProducts.length === 0) {
            showEmptyCart();
            updateSummary();
            return;
        }

        cartProducts.forEach(item => {
            const cartItem = document.createElement("div");
            cartItem.classList.add("cart-item");

            const imageContainer = document.createElement("div");
            imageContainer.classList.add("cart-product-image");

            const image = document.createElement("img");
            image.src = item.image;
            image.alt = item.name;

            imageContainer.appendChild(image);

            const productInfo = document.createElement("div");
            productInfo.classList.add("cart-product-info");

            const productName = document.createElement("h3");
            productName.textContent = item.name;

            const productCategory = document.createElement("p");
            productCategory.textContent = item.category;

            const productPrice = document.createElement("span");
            productPrice.textContent = `$${item.price.toFixed(2)}`;

            productInfo.append(productName, productCategory, productPrice);

            const quantityContainer = document.createElement("div");
            quantityContainer.classList.add("quantity");

            const decreaseButton = document.createElement("button");
            decreaseButton.type = "button";
            decreaseButton.textContent = "-";
            decreaseButton.setAttribute("aria-label", "Decrease quantity");

            const quantityValue = document.createElement("span");
            quantityValue.textContent = item.quantity;

            const increaseButton = document.createElement("button");
            increaseButton.type = "button";
            increaseButton.textContent = "+";
            increaseButton.setAttribute("aria-label", "Increase quantity");

            quantityContainer.append(
                decreaseButton,
                quantityValue,
                increaseButton
            );

            const removeButton = document.createElement("button");
            removeButton.type = "button";
            removeButton.classList.add("remove-item");
            removeButton.textContent = "Remove";

            decreaseButton.addEventListener("click", () => {
                if (item.quantity <= 1) return;

                item.quantity--;

                const savedItem = cart.find(
                    cartItem => cartItem.productId === item.productId
                );

                if (savedItem) savedItem.quantity = item.quantity;

                saveCart();
                quantityValue.textContent = item.quantity;
                updateSummary();
            });

            increaseButton.addEventListener("click", () => {
                item.quantity++;

                const savedItem = cart.find(
                    cartItem => cartItem.productId === item.productId
                );

                if (savedItem) savedItem.quantity = item.quantity;

                saveCart();
                quantityValue.textContent = item.quantity;
                updateSummary();
            });

            removeButton.addEventListener("click", () => {
                cart = cart.filter(
                    cartItem => cartItem.productId !== item.productId
                );

                cartProducts = cartProducts.filter(
                    cartItem => cartItem.productId !== item.productId
                );

                saveCart();
                renderCart();
            });

            cartItem.append(
                imageContainer,
                productInfo,
                quantityContainer,
                removeButton
            );

            cartContainer.appendChild(cartItem);
        });

        updateSummary();
    };

    if (window.productsReady) {
        window.productsReady
            .then(products => {
                syncCartProducts(products);
                renderCart();
            })
            .catch(error => {
                console.error("Unable to load cart products:", error);
                cartContainer.textContent =
                    "Unable to load your cart. Please refresh the page.";
            });
    } else {
        cartContainer.textContent =
            "Product data is unavailable. Please refresh the page.";
    }

    window.addEventListener("pageshow", event => {
        if (event.persisted) {
            window.location.reload();
        }
    });
}
