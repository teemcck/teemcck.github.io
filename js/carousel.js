// Jams carousel: turns the jam list into two full-width tiles, a wheel selector and a detail window below it.
// The original list stays in the HTML (and on screen without JS); this script hides it once the tiles exist.

(() => {
    const source = document.querySelector('#ws-jams [aria-labelledby="jamlist-title"]');
    const articles = source ? [...source.querySelectorAll("article.jam")] : [];
    if (articles.length < 2) return;

    const ROOT = "~/jams";
    const n = articles.length;
    let active = 0;
    let first = true;

    function make(tag, cls, text) {
        const el = document.createElement(tag);
        if (cls) el.className = cls;
        if (text != null) el.textContent = text;
        return el;
    }

    const items = articles.map(article => ({ article, name: article.querySelector("h3").textContent.trim(), o: 0 }));

    // ---- selector tile ----
    const wheelWin = make("section", "win wheel-win");
    wheelWin.setAttribute("aria-label", "Jam selector");
    const title = make("div", "title");
    const pos = make("span");
    title.append(make("span", null, ROOT), pos);

    const wheel = make("div", "wheel");
    wheel.tabIndex = 0;
    wheel.setAttribute("role", "group");
    wheel.setAttribute("aria-roledescription", "carousel");
    wheel.setAttribute("aria-label", "Game jams: left and right arrow keys to browse, Enter to open");
    const live = make("span", "visually-hidden");
    live.setAttribute("aria-live", "polite");

    items.forEach((it, i) => {
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
            if (i === active) openCurrent();
            else go(i);
        });
        it.card = card;
        wheel.append(card);
    });

    // the arrows sit at fixed spots on the wheel's edges, so repeated clicks never need the cursor to move
    const prev = make("button", "wheel-arrow prev", "[←]");
    const next = make("button", "wheel-arrow next", "[→]");
    prev.type = next.type = "button";
    prev.setAttribute("aria-label", "Previous jam");
    next.setAttribute("aria-label", "Next jam");
    prev.addEventListener("click", () => go(active - 1));
    next.addEventListener("click", () => go(active + 1));
    wheel.append(prev, next, live);

    wheelWin.append(title, wheel);

    // ---- detail tile ----
    // every jam gets a pane up front; they share one grid cell, so the tile is always as tall as the
    // longest entry and never resizes while browsing
    const detailWin = make("section", "win detail-win");
    detailWin.setAttribute("aria-label", "Selected jam");
    const dTitle = make("div", "title");
    dTitle.setAttribute("aria-hidden", "true");
    const dPath = make("span");
    dTitle.append(dPath, make("span", null, "stat"));
    const dBody = make("div", "body detail-stack");
    dBody.tabIndex = 0;
    items.forEach(it => {
        const pane = make("div", "detail-pane");
        const prompt = make("div", "prompt");
        prompt.setAttribute("aria-hidden", "true");
        prompt.innerHTML = "<b>tristan@debian</b>:~$ ls -ld ";
        prompt.append(ROOT + "/" + it.name);
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
    source.before(layout);
    source.hidden = true;

    // ---- behaviour ----
    function render() {
        items.forEach((it, i) => {
            let o = ((i - active) % n + n) % n;
            if (o > n / 2) o -= n;
            const abs = Math.abs(o);
            const card = it.card;
            // a card wrapping from one end of the wheel to the other jumps instead of sweeping across
            // (and nothing animates on the first paint)
            const jump = first || Math.abs(o - it.o) > n / 2 || card.classList.contains("off");
            if (jump) card.classList.add("jump");
            card.style.setProperty("--o", o);
            card.style.setProperty("--abs", abs);
            card.style.zIndex = 10 - abs;
            card.classList.toggle("on", o === 0);
            card.classList.toggle("off", abs > 2);
            if (jump) { void card.offsetWidth; card.classList.remove("jump"); }
            it.o = o;
        });
        first = false;

        const it = items[active];
        pos.textContent = "[" + (active + 1) + "/" + n + "]";
        live.textContent = (active + 1) + " of " + n + ": " + it.name;
        dPath.textContent = ROOT + "/" + it.name;
        items.forEach(x => x.pane.classList.toggle("shown", x === it));
        dBody.scrollTop = 0;
        it.pane.classList.remove("swap");
        void it.pane.offsetWidth;
        it.pane.classList.add("swap");
    }

    function go(i) {
        active = ((i % n) + n) % n;
        render();
    }

    // Enter (or clicking the centred card) follows the first link in the links row
    // (not links inside the blurb, like a jam sponsor)
    function openCurrent() {
        items[active].pane.querySelector(".links a")?.click();
    }

    wheel.addEventListener("keydown", e => {
        const keys = { ArrowLeft: active - 1, ArrowRight: active + 1, Home: 0, End: n - 1 };
        if (e.key in keys) { e.preventDefault(); go(keys[e.key]); }
        else if (e.key === "Enter" && !e.target.closest("button")) { e.preventDefault(); openCurrent(); }
    });

    // drag / swipe: each 50px of travel turns the wheel one step
    let x0 = null, dragged = false;
    wheel.addEventListener("pointerdown", e => {
        if (e.target.closest("button")) return;
        x0 = e.clientX;
        dragged = false;
    });
    wheel.addEventListener("pointermove", e => {
        if (x0 == null) return;
        const dx = e.clientX - x0;
        if (Math.abs(dx) > 50) { go(active + (dx < 0 ? 1 : -1)); x0 = e.clientX; dragged = true; }
    });
    const end = () => { x0 = null; setTimeout(() => (dragged = false)); };
    wheel.addEventListener("pointerup", end);
    wheel.addEventListener("pointercancel", end);
    wheel.addEventListener("pointerleave", () => (x0 = null));

    render();
})();
