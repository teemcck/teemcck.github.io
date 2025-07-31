// Get the height of the header for offset calculations.
const header = document.querySelector('header');
const scrollTopPadding = 30; // Padding to ensure the scroll target is not too close to header.
const scrollOffset = header.offsetHeight + scrollTopPadding;

// Add event listener to hamburger menu.
document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.querySelector('.hamburger');
    // Toggle nav visibility when hamburger is clicked.
    hamburger.addEventListener('click', toggleHamburger);
});

// Add event listener to mobile nav links.
document.addEventListener("DOMContentLoaded", () => {
  const links = document.querySelectorAll(".mobile-link");
  const mobileNavMenu = document.querySelector(".mobile-nav-links");

  links.forEach(link => {
    link.addEventListener("click", () => {
      const targetId = link.getAttribute("data-target"); // Custom attribute for target section.
      const targetElement = document.getElementById(targetId);
      // If target element exists, scroll to it.
      if (targetElement) {
        scrollToTarget(targetElement);
        toggleHamburger();
      }
      // Hide mobile nav
      mobileNavMenu.classList.remove("open");
    });
  });
});

// Add event listener to desktop nav links.
document.addEventListener("DOMContentLoaded", () => {
  const links = document.querySelectorAll(".desktop-link");

  links.forEach(link => {
    link.addEventListener("click", () => {
      const targetId = link.getAttribute("data-target"); // Custom attribute for target section.
      const targetElement = document.getElementById(targetId);
      // If target element exists, scroll to it.
      if (targetElement) {
        scrollToTarget(targetElement);
      }
    });
  });
});

// Helper function for smooth scrolling to target sections.
function scrollToTarget(targetElement) {
    const elementY = targetElement.getBoundingClientRect().top + window.scrollY;
    // Scroll to position adjusted for header height.
    window.scrollTo({
        top: elementY - scrollOffset,
        behavior: "smooth"
    });
}

// Helper function for hiding/revealing mobile hamburger menu.
function toggleHamburger() {
    const navLinks = document.querySelector('.mobile-nav-links');

    // Toggle the visibility of the mobile navigation links.
    if (navLinks.classList.contains('mobile-nav-links-visible')) {
        navLinks.classList.remove('mobile-nav-links-visible');
        setTimeout(() => {
            navLinks.style.visibility = 'hidden';
        }, 300); // Match the CSS transition duration.
    } else {
        navLinks.style.visibility = 'visible';
        navLinks.classList.add('mobile-nav-links-visible');
    }
}