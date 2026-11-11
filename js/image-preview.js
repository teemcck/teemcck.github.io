// Click an image to see it larger, with its caption
(() =>
{
    const images = document.querySelectorAll("#blog-content img, img[data-preview]");
    if (!images.length) return;

    const dialog = document.createElement("dialog");
    dialog.id = "image-preview";
    dialog.setAttribute("aria-label", "Image preview");

    const preview = document.createElement("img");
    preview.alt = "";
    const caption = document.createElement("p");
    caption.className = "image-preview-caption";
    dialog.append(preview, caption);
    document.body.append(dialog);

    function open(image)
    {
        preview.src = image.currentSrc || image.src;
        preview.alt = image.alt;

        const figcaption = image.closest("figure")?.querySelector("figcaption");
        const text = figcaption ? figcaption.textContent.trim().replace(/\s+/g, " ") : "";
        caption.textContent = text;
        caption.hidden = !text;

        dialog.showModal();
    }

    images.forEach(image =>
    {
        image.classList.add("previewable");
        image.tabIndex = 0;
        image.setAttribute("role", "button");
        image.addEventListener("click", () => open(image));
        image.addEventListener("keydown", e =>
        {
            if (e.key === "Enter" || e.key === " ")
            {
                e.preventDefault();
                open(image);
            }
        });
    });

    dialog.addEventListener("click", () => dialog.close());
    dialog.addEventListener("close", () => preview.removeAttribute("src"));
})();
