// Find footer year by ID.
const yearSpan = document.querySelector("#currentYear");

// Update the current year on page load.
yearSpan.textContent = new Date().getFullYear();