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



// Jams: size the list window relative to the first projects window (~/projects/game-dev).
// The projects workspace is usually hidden here, so it is unhidden just long enough to measure;
// this all happens synchronously, so nothing flashes on screen.
const jamsRef = document.querySelector("#ws-projects .win > .body");
jamsRef?.querySelectorAll("img").forEach(img => {
    img.loading = "eager"; // lazy images in a hidden workspace never load, which would throw off the measurement
    img.addEventListener("load", sizeJams);
});
function sizeJams() {
    const body = document.querySelector('#ws-jams [aria-labelledby="jamlist-title"] > .body');
    if (!body || !jamsRef || !body.offsetParent) return;
    const projects = document.getElementById("ws-projects");
    const wasHidden = projects.hidden;
    projects.hidden = false;
    const h = jamsRef.getBoundingClientRect().height;
    projects.hidden = wasHidden;
    // 1.125x the projects window, but never taller than 85% of the viewport (matters on phones)
    body.style.maxHeight = h ? Math.round(Math.min(h * 1.125, innerHeight * 0.85)) + "px" : "";
}
window.addEventListener("resize", sizeJams);
document.querySelectorAll("#ws-jams img").forEach(img => img.addEventListener("load", sizeJams));
document.fonts?.ready.then(sizeJams);
sizeJams();
