// Carousel: turns the project and jam lists into two tiles, a wheel selector and a detail window.
// The original lists stay in the HTML (and on screen without JS); this script hides them once the tiles exist.

(() => {
    const carousels = [];

    function make(tag, cls, text) {
        const el = document.createElement(tag);
        if (cls) el.className = cls;
        if (text != null) el.textContent = text;
        return el;
    }

    // "mystic-garden/" from an entry's h3, without the permission bits and dates
    function nameOf(article) {
        const h3 = article.querySelector("h3").cloneNode(true);
        h3.querySelectorAll(".perm, .when").forEach(el => el.remove());
        return h3.textContent.trim();
    }

    function build({ sources, root, label }) {
        const items = [];
        sources.forEach(section => {
            const path = section.querySelector(".title span").textContent.trim();
            section.querySelectorAll("article").forEach(article => {
                items.push({ article, path, cat: path.split("/").pop(), name: nameOf(article), o: 0 });
            });
        });
        if (items.length < 2) return;

        const cats = [...new Set(items.map(it => it.cat))];
        const filtered = sources.length > 1;
        let filter = "all";
        let active = 0;
        let first = true;

        // ---- selector tile ----
        const wheelWin = make("section", "win wheel-win");
        wheelWin.setAttribute("aria-label", label + " selector");
        const title = make("div", "title");
        title.append(make("span", null, root));
        const right = make("span", filtered ? "wheel-filter" : null, filtered ? null : "ls");
        const filterButtons = [];
        if (filtered) {
            ["all", ...cats].forEach(cat => {
                const b = make("button", null, cat);
                b.type = "button";
                b.setAttribute("aria-pressed", cat === filter);
                b.addEventListener("click", () => setFilter(cat));
                filterButtons.push(b);
                right.append(b);
            });
        }
        title.append(right);

        const wheel = make("div", "wheel");
        wheel.tabIndex = 0;
        wheel.setAttribute("role", "group");
        wheel.setAttribute("aria-roledescription", "carousel");
        wheel.setAttribute("aria-label", label + ": left and right arrow keys to browse, Enter to open");

        items.forEach(it => {
            const card = make("div", "wheel-card");
            card.setAttribute("aria-hidden", "true");
            const src = it.article.querySelector("img");
            if (src) {
                const img = make("img");
                img.src = src.getAttribute("src");
                img.alt = "";
                img.draggable = false;
                card.append(img);
            }
            card.append(make("span", null, it.name));
            card.addEventListener("click", () => {
                if (dragged) return;
                const vis = visible();
                const i = vis.indexOf(it);
                if (i === active) openCurrent();
                else if (i >= 0) go(i);
            });
            it.card = card;
            wheel.append(card);
        });

        const nav = make("div", "wheel-nav");
        const prev = make("button", null, "[←]");
        const next = make("button", null, "[→]");
        prev.type = next.type = "button";
        prev.setAttribute("aria-label", "Previous");
        next.setAttribute("aria-label", "Next");
        const pos = make("span", "wheel-pos");
        pos.setAttribute("aria-live", "polite");
        prev.addEventListener("click", () => go(active - 1));
        next.addEventListener("click", () => go(active + 1));
        nav.append(prev, pos, next);

        wheelWin.append(title, wheel, nav);

        // ---- detail tile ----
        const detailWin = make("section", "win detail-win");
        detailWin.setAttribute("aria-label", "Selected " + label.toLowerCase().replace(/s$/, ""));
        const dTitle = make("div", "title");
        dTitle.setAttribute("aria-hidden", "true");
        const dPath = make("span");
        dTitle.append(dPath, make("span", null, "stat"));
        // every entry gets a pane up front; they share one grid cell, so the tile is always as tall as the
        // longest entry and never resizes while browsing
        const dBody = make("div", "body detail-stack");
        dBody.tabIndex = 0;
        items.forEach(it => {
            const pane = make("div", "detail-pane");
            const prompt = make("div", "prompt");
            prompt.setAttribute("aria-hidden", "true");
            prompt.innerHTML = "<b>tristan@debian</b>:~$ ls -ld ";
            prompt.append(it.path + "/" + it.name);
            const copy = it.article.cloneNode(true);
            copy.removeAttribute("id");
            copy.className = "detail-entry";
            copy.querySelector(":scope > img")?.remove();
            pane.append(prompt, copy);
            it.pane = pane;
            dBody.append(pane);
        });
        detailWin.append(dTitle, dBody);

        const layout = make("div", "carousel");
        layout.append(wheelWin, detailWin);
        sources[0].before(layout);
        sources.forEach(s => (s.hidden = true));

        // ---- behaviour ----
        function visible() {
            return items.filter(it => filter === "all" || it.cat === filter);
        }

        function render() {
            const vis = visible();
            const n = vis.length;
            items.forEach(it => {
                const i = vis.indexOf(it);
                let o = 0, abs = 3;
                if (i >= 0) {
                    o = ((i - active) % n + n) % n;
                    if (o > n / 2) o -= n;
                    abs = Math.abs(o);
                }
                const card = it.card;
                // a card wrapping from one end of the wheel to the other jumps instead of sweeping across
                // (and nothing animates on the first paint)
                const jump = first || Math.abs(o - it.o) > n / 2 || i < 0 || card.classList.contains("off");
                if (jump) card.classList.add("jump");
                card.style.setProperty("--o", o);
                card.style.setProperty("--abs", abs);
                card.style.zIndex = 10 - abs;
                card.classList.toggle("on", i >= 0 && o === 0);
                card.classList.toggle("off", i < 0 || abs > 2);
                if (jump) { void card.offsetWidth; card.classList.remove("jump"); }
                it.o = o;
            });
            first = false;

            const it = vis[active];
            pos.textContent = (active + 1) + "/" + n + "  " + it.name;
            dPath.textContent = it.path + "/" + it.name;
            items.forEach(x => x.pane.classList.toggle("shown", x === it));
            dBody.scrollTop = 0;
            it.pane.classList.remove("swap");
            void it.pane.offsetWidth;
            it.pane.classList.add("swap");
        }

        function go(i) {
            const n = visible().length;
            active = ((i % n) + n) % n;
            render();
        }

        function setFilter(cat, keep) {
            const current = keep || visible()[active];
            filter = cat;
            filterButtons.forEach(b => b.setAttribute("aria-pressed", b.textContent === cat));
            const i = visible().indexOf(current);
            go(i >= 0 ? i : 0);
        }

        // Enter (or clicking the centred card) follows the devlog link, else the first link in the links row
        // (not links inside the blurb, like a jam sponsor)
        function openCurrent() {
            const pane = dBody.querySelector(".detail-pane.shown");
            const link = pane?.querySelector('a[href^="blogs/"]') || pane?.querySelector(".links a");
            link?.click();
        }

        wheel.addEventListener("keydown", e => {
            const keys = { ArrowLeft: active - 1, ArrowRight: active + 1, Home: 0, End: visible().length - 1 };
            if (e.key in keys) { e.preventDefault(); go(keys[e.key]); }
            else if (e.key === "Enter") { e.preventDefault(); openCurrent(); }
        });

        // drag / swipe: each 50px of travel turns the wheel one step
        let x0 = null, dragged = false;
        wheel.addEventListener("pointerdown", e => { x0 = e.clientX; dragged = false; });
        wheel.addEventListener("pointermove", e => {
            if (x0 == null) return;
            const dx = e.clientX - x0;
            if (Math.abs(dx) > 50) { go(active + (dx < 0 ? 1 : -1)); x0 = e.clientX; dragged = true; }
        });
        const end = () => { x0 = null; setTimeout(() => (dragged = false)); };
        wheel.addEventListener("pointerup", end);
        wheel.addEventListener("pointercancel", end);
        wheel.addEventListener("pointerleave", () => (x0 = null));

        carousels.push({
            select(id) {
                const it = items.find(x => x.article.id === id);
                if (!it) return false;
                setFilter("all", it);
                wheelWin.scrollIntoView({ block: "start", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
                wheel.focus({ preventScroll: true });
                return true;
            }
        });

        render();
    }

    build({
        sources: [...document.querySelectorAll("#ws-projects > section.win")],
        root: "~/projects",
        label: "Projects"
    });
    build({
        sources: [document.querySelector('#ws-jams [aria-labelledby="jamlist-title"]')].filter(Boolean),
        root: "~/jams",
        label: "Jams"
    });

    // used by the status bar's "now: ..." link (js/hub.js)
    window.selectInCarousel = id => carousels.some(c => c.select(id));
})();
