// Add event listener to header menu.
document.addEventListener('DOMContentLoaded', () => {
    const navLinkItems = document.querySelectorAll('.desktop-nav-links li');

    // Focus on mouse enter.
    for (const listeningItem of navLinkItems) {
        listeningItem.addEventListener('mouseenter', () => {
            // Toggle focused on entered element, unfocus others.
            for (const item of navLinkItems) {
                if (item !== listeningItem) {
                    item.classList.remove('desktop-nav-links-focused');
                    item.classList.add('desktop-nav-links-unfocused');
                }
            }
            listeningItem.classList.remove('desktop-nav-links-unfocused');
            listeningItem.classList.add('desktop-nav-links-focused');
        });
    }

    // Unfocus on mouse exit.
    for (const listeningItem of navLinkItems) {
        listeningItem.addEventListener('mouseleave', () => {
            // Remove focus and unfocus classes when the mouse leaves.
            listeningItem.classList.remove('desktop-nav-links-focused');
            for (const item of navLinkItems) {
                item.classList.remove('desktop-nav-links-unfocused');
            }
        });
    }
});
