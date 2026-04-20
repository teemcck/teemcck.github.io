const about = document.querySelector("#about");
const skills = document.querySelector("#skills");
const projects = document.querySelector("#projects");
const contact = document.querySelector("#contact");

const links = document.querySelectorAll(".desktop-link");
const sections = document.querySelectorAll(".section-container");

function showSection(targetId) {
  sections.forEach(section => {
    section.style.display = section.id === targetId ? "block" : "none";
    section.classList.toggle("active", section.id === targetId);
  });
}

// Show "about" by default
showSection("about");

// Set initial active nav link
links.forEach(link => {
  if (link.dataset.target === "about") {
    link.classList.add("active");
  }
});

let activeLink = document.querySelector('.desktop-link[data-target="about"]');

links.forEach(link => {
  link.addEventListener("click", () => {
    const targetId = link.dataset.target;

    // Remove active class from previous link
    if (activeLink) {
      activeLink.classList.remove("active");
    }

    // Show the target section, hide others
    showSection(targetId);

    // Mark new link as active
    link.classList.add("active");
    activeLink = link;
  });
});