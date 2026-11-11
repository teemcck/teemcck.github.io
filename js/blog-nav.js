// Builds the contents list from each h3 in the post
(() =>
{
    const content = document.getElementById("blog-content");
    if (!content) return;

    const headings = content.querySelectorAll("h3");
    if (!headings.length) return;

    const nav = document.createElement("nav");
    nav.id = "section-nav";
    nav.setAttribute("aria-label", "Article contents");

    const toggle = document.createElement("button");
    toggle.id = "contents-toggle";
    toggle.type = "button";
    toggle.setAttribute("aria-controls", "section-links");
    toggle.append("Contents ");
    const action = document.createElement("span");
    action.className = "contents-action";
    toggle.append(action);

    const links = document.createElement("ul");
    links.id = "section-links";
    headings.forEach((heading, index) =>
    {
        heading.id = `section-${index + 1}`;

        const item = document.createElement("li");
        const link = document.createElement("a");
        link.href = `#${heading.id}`;
        link.textContent = heading.textContent.trim();
        item.append(link);
        links.append(item);
    });

    function setExpanded(expanded)
    {
        toggle.setAttribute("aria-expanded", String(expanded));
        nav.classList.toggle("is-collapsed", !expanded);
        action.textContent = expanded ? "[hide]" : "[show]";
    }

    setExpanded(false);
    toggle.addEventListener("click", () =>
    {
        setExpanded(toggle.getAttribute("aria-expanded") !== "true");
    });

    // on mobile, close the list after jumping to a section
    links.addEventListener("click", e =>
    {
        if (e.target.closest("a") && window.matchMedia("(max-width: 799px)").matches)
        {
            setExpanded(false);
            toggle.focus({ preventScroll: true });
        }
    });

    nav.append(toggle, links);
    content.before(nav);
})();
