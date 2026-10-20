
window.externalProducts = [];

window.productsReady = (async function () {
    const categories = [
        "mens-shoes",
        "womens-shoes",
        "mens-shirts",
        "tops",
        "womens-dresses",
        "womens-bags",
        "sunglasses"
    ];

    try {
        const results = await Promise.all(
            categories.map(async category => {
                const response = await fetch(
                    `https://dummyjson.com/products/category/${category}`
                );

                if (!response.ok) {
                    throw new Error(`Failed to load category: ${category}`);
                }

                return response.json();
            })
        );

        const uniqueProducts = new Map();

        results
            .flatMap(result => result.products)
            .forEach(product => {
                uniqueProducts.set(product.id, product);
            });

        window.externalProducts = [...uniqueProducts.values()].map(product => ({
            id: `api-${product.id}`,
            name: product.title,
            category: product.category,
            description: product.description,
            price: product.price,
            image: product.thumbnail,
            rating: product.rating,
            images: product.images || []
        }));

        console.log(
            "External products loaded:",
            window.externalProducts.length
        );

        return window.externalProducts;

    } catch (error) {
        console.error("Products API Error:", error);
        return [];
    }
})();
