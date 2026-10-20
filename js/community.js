
const communityDesigns = [
    {
        id: 1,
        name: "Midnight Blue",
        creator: "Alex",
        image: "/images/s1.jpg"
    },
    {
        id: 2,
        name: "Clean White",
        creator: "Mohamed",
        image: "/images/s2.jpg"
    },
    {
        id: 3,
        name: "Red Storm",
        creator: "Chris",
        image: "/images/s3.jpg"
    },
    {
        id: 4,
        name: "Urban Gray",
        creator: "Jack",
        image: "/images/s4.jpg"
    }
];


let likedDesigns = JSON.parse(
    localStorage.getItem("communityLikes")
) || [];

const communityGrid = document.querySelector(".community-grid");

if (communityGrid) {
    communityDesigns.forEach(design => {
            communityGrid.insertAdjacentHTML("beforeend", `
                <article class="design-card" data-design-id="${design.id}">

                    <div class="design-image">
                        <img src="${design.image}" alt="${design.name} custom sneaker">

                        <button
                            class="like-btn"
                            type="button"
                            aria-label="Like ${design.name}"
                            aria-pressed="${likedDesigns.includes(design.id)}"
                        >
                            <i class="${likedDesigns.includes(design.id) ? "fa-solid" : "fa-regular"} fa-heart"></i>
                        </button>
                    </div>

                    <div class="design-info">
                        <div>
                            <h3>${design.name}</h3>
                            <span>by ${design.creator}</span>
                        </div>

                        <button class="edit-design" type="button">
                            Edit
                            <i class="fa-solid fa-pen"></i>
                        </button>
                    </div>

                </article>
            `);
        });
    };


communityGrid.addEventListener("click", function (event) {
    const likeButton = event.target.closest(".like-btn");

    if (!likeButton) return;

    const designCard = likeButton.closest(".design-card");
    const designId = Number(designCard.dataset.designId);

    if (likedDesigns.includes(designId)) {
        likedDesigns = likedDesigns.filter(id => id !== designId);
    } else {
        likedDesigns.push(designId);
    }

    localStorage.setItem("communityLikes", JSON.stringify(likedDesigns));

    const isLiked = likedDesigns.includes(designId);

    likeButton.setAttribute("aria-pressed", isLiked);

    const heartIcon = likeButton.querySelector("i");

    heartIcon.classList.toggle("fa-solid", isLiked);
    heartIcon.classList.toggle("fa-regular", !isLiked);
});