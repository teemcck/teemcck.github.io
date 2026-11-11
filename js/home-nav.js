const navList = document.getElementById("nav-list");
const sections = document.querySelectorAll("section");

showSection("about");

navList.addEventListener("click", e =>
{
    const button = e.target.closest("button");
    if (!button) return;

    showSection(button.dataset.section);
});

function showSection(id)
{
    sections.forEach(section =>
        section.style.display = section.id === id ? "block" : "none"
    );

    [...navList.children].forEach(button =>
    {
        const active = button.dataset.section === id;
        button.classList.toggle("active", active);
        if (active) button.setAttribute("aria-current", "true");
        else button.removeAttribute("aria-current");
    });

    if (id === "skills") typeSkills();
    revealSection(document.getElementById(id));
}
