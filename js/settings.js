// [fx] menu: pick a color theme and turn the CRT effects on or off.
// Choices are remembered per browser. The inline snippet in each page's <head>
// applies the same logic before first paint so there's no flash.

(() => {
    const KEY = "crt-fx";
    const THEMES = ["kanagawa", "solarized", "gruvbox", "catppuccin", "moss"];
    const root = document.documentElement;

    // scanlines and glow start off; visitors can turn them on in the [fx] menu.
    // switching themes leaves the effect toggles alone
    function themeDefaults() {
        return { scanlines: false, glow: false };
    }

    function load() {
        let saved = {};
        try { saved = JSON.parse(localStorage.getItem(KEY) || "{}"); } catch (e) { /* storage unavailable */ }
        const theme = THEMES.includes(saved.theme) ? saved.theme : "kanagawa";
        return { theme, pixel: true, ...themeDefaults(), ...saved, theme };
    }


    // favicon: a pixel "tm" redrawn in the current theme's colors
    const TM = [3,4,3,5,2,6,3,6,4,6,5,6,3,7,3,8,3,9,3,10,4,11,5,11,7,7,7,8,7,9,7,10,7,11,10,8,10,9,10,10,10,11,13,8,13,9,13,10,13,11,8,7,9,7,11,7,12,7];
    function paintFavicon() {
        const cs = getComputedStyle(root), v = n => cs.getPropertyValue(n).trim();
        let px = "";
        for (let i = 0; i < TM.length; i += 2) px += `<rect x="${TM[i]}" y="${TM[i + 1]}" width="1" height="1"/>`;
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><rect x="0.5" y="0.5" width="15" height="15" rx="3" fill="${v("--bg")}" stroke="${v("--line")}"/><g fill="${v("--fg")}" shape-rendering="crispEdges">${px}</g></svg>`;
        const href = "data:image/svg+xml," + encodeURIComponent(svg);
        document.querySelectorAll('link[rel="icon"]').forEach(l => { l.type = "image/svg+xml"; l.href = href; });
    }

    function apply(prefs) {
        root.dataset.theme = prefs.theme;
        for (const k of ["scanlines", "glow", "pixel"]) root.dataset[k] = prefs[k] ? "on" : "off";
        paintFavicon();
    }

    function save(prefs) {
        try { localStorage.setItem(KEY, JSON.stringify(prefs)); } catch (e) { /* ignore */ }
    }

    const prefs = load();
    apply(prefs);

    const button = document.getElementById("fx-toggle");
    const panel = document.getElementById("fx-panel");
    if (!button || !panel) return;

    const boxes = panel.querySelectorAll("input[data-fx]");
    const radios = panel.querySelectorAll('input[name="fx-theme"]');
    function sync() {
        boxes.forEach(b => { b.checked = prefs[b.dataset.fx]; });
        radios.forEach(r => { r.checked = r.value === prefs.theme; });
    }
    sync();

    boxes.forEach(input => input.addEventListener("change", () => {
        prefs[input.dataset.fx] = input.checked;
        apply(prefs); save(prefs);
    }));
    radios.forEach(radio => radio.addEventListener("change", () => {
        if (!radio.checked) return;
        prefs.theme = radio.value; // scanlines and glow keep whatever the visitor has set
        apply(prefs); save(prefs); sync();
    }));

    function setOpen(open) {
        panel.hidden = !open;
        button.setAttribute("aria-expanded", String(open));
    }
    button.addEventListener("click", () => setOpen(panel.hidden));
    document.addEventListener("keydown", e => {
        if (e.key === "Escape" && !panel.hidden) { setOpen(false); button.focus(); }
    });
    document.addEventListener("click", e => {
        if (!panel.hidden && !panel.contains(e.target) && e.target !== button) setOpen(false);
    });
})();
