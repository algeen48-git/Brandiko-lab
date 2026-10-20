const products = [

{
    id: 1,
    name: "pants",
    category: "Pants",
    description: "A unique limited design made to stand out.",
    price: 1650,
    image: "/images/s1.jpg",
    rating: 6.9
},
{
    id: 2,
    name: "Product Name",
    category: "Sneakers",
    description: "A unique limited design made to stand out.",
    price: 1300,
    image: "/images/s2.jpg",
    rating: 5.4
},
{
    id: 3,
    name: "Product Name",
    category: "Sneakers",
    description: "A unique limited design made to stand out.",
    price: 3250,
    image: "/images/s3.jpg",
    rating: 7.8
},
{
    id: 4,
    name: "Product Name",
    category: "Sneakers",
    description: "A unique limited design made to stand out.",
    price: 4000,
    image: "/images/s4.jpg",
    rating: 8.9
}
];

function addToCart(product) {

    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    const itemCart = cart.find(
        item => item.productId === product.id
    );

    if (itemCart) {
        itemCart.quantity += 1;
    } else {
        cart.push({
            productId: product.id,
            quantity: 1
        });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
}










