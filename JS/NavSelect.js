const about = document.querySelector("#about");
const skills = document.querySelector("#skills");
const projects = document.querySelector("#projects");
const contact = document.querySelector("#contact");

const links = document.querySelectorAll(".desktop-link");
const sections = document.querySelectorAll(".section-container");

let blinkInterval = null;

function startBlink(link) {
  let visible = true;
  blinkInterval = setInterval(() => {
    visible = !visible;
    if (visible) {
        link.classList.add("active");
    }
    else {
        link.classList.remove("active");
    }
  }, 600);
}

function stopBlink(link) {
  clearInterval(blinkInterval);
  blinkInterval = null;
  link.classList.remove("active");
}

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
    startBlink(link);
  }
});

let activeLink = document.querySelector('.desktop-link[data-target="about"]');

links.forEach(link => {
  link.addEventListener("click", () => {
    const targetId = link.dataset.target;

    // Stop blinking previous active link
    if (activeLink) {
      stopBlink(activeLink);
    }

    // Show the target section, hide others
    showSection(targetId);

    // Mark new link as active and start blink
    link.classList.add("active");
    activeLink = link;
    startBlink(link);
  });
});