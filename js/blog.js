// Devlog post: build the contents list from the article's section headings.

(() => {
    const article = document.querySelector(".article .body");
    const list = document.getElementById("toc-list");
    if (!article || !list) return;

    const used = new Set();
    function slug(text) {
        let base = text.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "section";
        let id = base, n = 2;
        while (used.has(id) || document.getElementById(id)) id = base + "-" + n++;
        used.add(id);
        return id;
    }

    article.querySelectorAll("h3").forEach(h => {
        if (!h.id) h.id = slug(h.textContent.trim());
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = "#" + h.id;
        a.textContent = h.textContent.trim();
        li.append(a);
        list.append(li);
    });

    // on narrow screens the contents start collapsed and close after a jump
    const details = list.closest("details");
    const narrow = matchMedia("(max-width: 860px)");
    function sync() { if (details) details.open = !narrow.matches; }
    sync();
    narrow.addEventListener("change", sync);
    list.addEventListener("click", e => {
        if (details && narrow.matches && e.target.closest("a")) details.open = false;
    });
})();
