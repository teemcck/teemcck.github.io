// Hub: switch between the home / projects / jams / skills workspaces.

const WORKSPACES = ["home", "projects", "jams", "skills"];

function show(name, moveFocus) {
    if (!WORKSPACES.includes(name)) name = "home";
    for (const ws of WORKSPACES) {
        document.getElementById("ws-" + ws).hidden = ws !== name;
    }
    document.querySelectorAll("#workspaces a").forEach(a => {
        if (a.dataset.ws === name) a.setAttribute("aria-current", "page");
        else a.removeAttribute("aria-current");
    });
    if (location.hash !== "#" + name) history.replaceState(null, "", "#" + name);
    if (moveFocus) document.getElementById("ws-" + name).focus({ preventScroll: true });
    if (name === "jams" && typeof sizeJams === "function") requestAnimationFrame(sizeJams);
}

document.querySelectorAll("#workspaces a").forEach(a => {
    a.addEventListener("click", e => {
        e.preventDefault();
        show(a.dataset.ws, true);
    });
});

window.addEventListener("hashchange", () => show(location.hash.slice(1)));
show(location.hash.slice(1));

// number keys 1-4 switch workspaces (ignored while typing or with modifier keys)
document.addEventListener("keydown", e => {
    if (e.ctrlKey || e.metaKey || e.altKey || e.target.closest("input, textarea, select")) return;
    const n = parseInt(e.key, 10);
    if (n >= 1 && n <= WORKSPACES.length) show(WORKSPACES[n - 1], true);
});

// "now: ..." in the status bar jumps to that project's entry
document.querySelectorAll("a.now[data-goto]").forEach(a => {
    a.addEventListener("click", e => {
        e.preventDefault();
        show("projects");
        const target = document.getElementById(a.dataset.goto);
        if (target) {
            target.scrollIntoView({ block: "start", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
            target.closest(".body")?.focus({ preventScroll: true });
        }
    });
});



// Jams: size the list window to show one and a half rows of previews, so it's clear the list continues
function sizeJams() {
    const body = document.querySelector('#ws-jams [aria-labelledby="jamlist-title"] > .body');
    const cards = body ? body.querySelectorAll(".jam") : [];
    if (cards.length < 2 || !body.offsetParent) return;
    body.style.maxHeight = "none";
    const top = body.getBoundingClientRect().top;
    const firstTop = cards[0].getBoundingClientRect().top;
    const next = [...cards].find(c => c.getBoundingClientRect().top > firstTop + 1);
    if (!next) { body.style.maxHeight = ""; return; }
    const nr = next.getBoundingClientRect();
    body.style.maxHeight = Math.round(nr.top - top + nr.height * 0.3) + "px";
}
window.addEventListener("resize", sizeJams);
document.querySelectorAll("#ws-jams img").forEach(img => img.addEventListener("load", sizeJams));
document.fonts?.ready.then(sizeJams);
sizeJams();
