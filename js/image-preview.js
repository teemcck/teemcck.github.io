// Include with `defer`. Applies to every image inside #blog-content (blog entries) and to any
// other image marked with a `data-preview` attribute (e.g. the photo on the home page).
// Clicking one opens a larger, centered preview over a dimmed page,
// with the figure's caption shown underneath when it has one.
(() => {
    if (document.getElementById('image-preview')) return;

    const images = document.querySelectorAll('#blog-content img, img[data-preview]');
    if (!images.length) return;

    const dialog = document.createElement('dialog');
    dialog.id = 'image-preview';
    dialog.setAttribute('aria-label', 'Image preview');

    const preview = document.createElement('img');
    preview.alt = '';
    const caption = document.createElement('p');
    caption.className = 'image-preview-caption';
    dialog.append(preview, caption);
    document.body.append(dialog);

    function open(image) {
        preview.src = image.currentSrc || image.src;
        preview.alt = image.alt;

        const figcaption = image.closest('figure')?.querySelector('figcaption');
        const text = figcaption ? figcaption.textContent.trim().replace(/\s+/g, ' ') : '';
        caption.textContent = text;
        caption.hidden = !text;

        dialog.showModal();
    }

    images.forEach((image) => {
        image.classList.add('previewable');
        image.tabIndex = 0;
        image.setAttribute('role', 'button');
        image.addEventListener('click', () => open(image));
        image.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                open(image);
            }
        });
    });

    // Any click while open closes the preview; Escape is handled by <dialog>.
    dialog.addEventListener('click', () => dialog.close());
    dialog.addEventListener('close', () => preview.removeAttribute('src'));
})();
