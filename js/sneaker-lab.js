
const sneakerPreviewImage = document.querySelector("#sneaker-preview-image");
const designName = document.querySelector("#design-name");
const customizationPanel = document.querySelector(".customization-panel");

// Available models.
// The current SVG is used for the Sneaker model only.
const models = {
    sneaker: {
        name: "Sneaker",
        image: "/images/sneaker.svg",
        isSvg: true
    },

    runner: {
        name: "Runner",
        image: "/images/runner.png",
        isSvg: false
    },

    "high-top": {
        name: "High-Top",
        image: "/images/high-top.png",
        isSvg: false
    }
};

const colors = {
    Black: "#171717",
    White: "#FFFFFF",
    Red: "#DC2626",
    Blue: "#2563EB",
    Gray: "#AEB4BC"
};

const design = {
    model: "sneaker",
    color: "Black",
    laces: "White",
    sole: "White",
    logo: "Classic Logo"
};

function getSvgDocument() {
    if (sneakerPreviewImage.tagName !== "OBJECT") {
        return null;
    }

    return sneakerPreviewImage.contentDocument;
}

function updateModel() {
    const model = models[design.model];

    if (!model) return;

    if (model.isSvg) {
        if (sneakerPreviewImage.tagName !== "OBJECT") {
            const object = document.createElement("object");

            object.id = "sneaker-preview-image";
            object.type = "image/svg+xml";
            object.setAttribute("aria-label", "Custom sneaker preview");

            sneakerPreviewImage.replaceWith(object);
            object.addEventListener("load", updatePreviewColors);

            // Update the reference after replacing the element.
            currentPreview = object;
        }

        currentPreview.data = model.image;
        currentPreview.addEventListener("load", updatePreviewColors, {
            once: true
        });
    } else {
        if (sneakerPreviewImage.tagName !== "IMG") {
            const img = document.createElement("img");

            img.id = "sneaker-preview-image";
            img.alt = "Custom sneaker preview";

            currentPreview.replaceWith(img);
            currentPreview = img;
        }

        currentPreview.src = model.image;
    }

    currentPreview.alt = `${model.name} sneaker preview`;
    designName.textContent = model.name;
}

let currentPreview = sneakerPreviewImage;

// Change SVG colors without applying filters to the whole image.
function updatePreviewColors() {
    const svg = getSvgDocument();

    if (!svg) return;

    const upperColors = {
        Black: ["#777777", "#292929", "#111111"],
        White: ["#FFFFFF", "#F8F8F8", "#E8E8E8"],
        Red: ["#F87171", "#DC2626", "#991B1B"],
        Blue: ["#60A5FA", "#2563EB", "#1E3A8A"],
        Gray: ["#E5E7EB", "#AEB4BC", "#737982"]
    };

    const upperIds = [
        "upper-highlight",
        "upper-base",
        "upper-shadow"
    ];

    upperIds.forEach((id, index) => {
        const stop = svg.getElementById(id);

        if (stop) {
            stop.setAttribute(
                "stop-color",
                upperColors[design.color][index]
            );
        }
    });

    // Recolor additional upper panels.
    const heel = svg.getElementById("heel-panel");
    const tongue = svg.getElementById("shoe-tongue");

    if (heel) heel.setAttribute("fill", colors[design.color]);
    if (tongue) tongue.setAttribute("fill", colors[design.color]);

    // Laces.
    const laces = svg.getElementById("shoe-laces");

    if (laces) {
        laces.querySelectorAll("path").forEach(path => {
            path.setAttribute("stroke", colors[design.laces]);
        });
    }

    // Sole.
    const soleGradient = svg.getElementById("soleShade");

    if (soleGradient) {
        const stops = soleGradient.querySelectorAll("stop");

        const soleColors = {
            White: ["#FFFFFF", "#D5D7D9"],
            Black: ["#555555", "#171717"],
            Blue: ["#60A5FA", "#2563EB"]
        };

        const selectedSole = soleColors[design.sole] || soleColors.White;

        stops.forEach((stop, index) => {
            if (selectedSole[index]) {
                stop.setAttribute("stop-color", selectedSole[index]);
            }
        });
    }
}

function updateActiveButton(button, group) {
    const container = button.parentElement;

    container.querySelectorAll("button[data-value]").forEach(item => {
        const active = item === button;

        item.classList.toggle("active", active);

        if (group === "color") {
            item.setAttribute("aria-pressed", String(active));
        }
    });
}

function updatePreview() {
    updateModel();
    updatePreviewColors();
}

customizationPanel.addEventListener("click", event => {
    const button = event.target.closest("button[data-value]");

    if (!button || !customizationPanel.contains(button)) return;

    const group = button.parentElement.dataset.group;
    const value = button.dataset.value;

    if (!group || !(group in design)) return;

    if (group === "model") {
        const normalized = value.trim().toLowerCase().replace(/\s+/g, "-");

        if (!models[normalized]) return;

        design.model = normalized;
    } else if (group === "color") {
        if (!Object.hasOwn(colors, value)) return;

        design.color = value;
    } else if (group === "laces") {
        if (!Object.hasOwn(colors, value)) return;

        design.laces = value;
    } else if (group === "sole") {
        if (!["White", "Black", "Blue"].includes(value)) return;

        design.sole = value;
    } else {
        design[group] = value;
    }

    updateActiveButton(button, group);
    updatePreview();

    console.log("Current design:", { ...design });
});

currentPreview.addEventListener("load", updatePreviewColors);
updatePreview();
