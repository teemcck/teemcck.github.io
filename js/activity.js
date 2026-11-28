// Activity: fill the ~/activity window with my 5 most recent public commits.
// One request to GitHub's commit search (no token, no caching), made after the page has loaded
// so it never competes with the page itself. If it fails, a link to my GitHub is shown instead.

(() => {
    const list = document.getElementById("commits");
    if (!list) return;

    const URL = "https://api.github.com/search/commits?q=author:teemcck&sort=author-date&order=desc&per_page=5";
    const UNITS = [[31536000, "y"], [2592000, "mo"], [604800, "w"], [86400, "d"], [3600, "h"], [60, "m"]];

    function ago(date) {
        const secs = (Date.now() - date) / 1000;
        for (const [size, label] of UNITS) {
            if (secs >= size) return Math.floor(secs / size) + label + " ago";
        }
        return "just now";
    }

    // build elements with textContent so commit messages can never inject markup
    function el(tag, className, text) {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (text != null) node.textContent = text;
        return node;
    }

    function row(item) {
        const li = el("li");
        const sha = el("a", "sha", item.sha.slice(0, 7));
        sha.href = item.html_url;
        sha.target = "_blank";
        sha.rel = "noopener noreferrer";
        const msg = item.commit.message.split("\n")[0];
        const date = new Date(item.commit.author.date);
        const when = el("time", "when", ago(date));
        when.dateTime = date.toISOString();
        when.title = date.toLocaleString();
        const msgEl = el("span", "msg", msg);
        msgEl.title = msg; // full message on hover when it's cut off
        li.append(sha, el("span", "repo", item.repository.name), msgEl, when);
        return li;
    }

    function fail() {
        const li = el("li", "commits-msg", "couldn't reach github; ");
        const a = el("a", null, "view on github");
        a.href = "https://github.com/teemcck";
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        li.append(a);
        list.replaceChildren(li);
    }

    function load() {
        fetch(URL, { headers: { Accept: "application/vnd.github+json" } })
            .then(res => res.ok ? res.json() : Promise.reject(res.status))
            .then(data => {
                if (!data.items || !data.items.length) throw new Error("no commits");
                list.replaceChildren(...data.items.map(row));
            })
            .catch(fail);
    }

    if (document.readyState === "complete") load();
    else window.addEventListener("load", load, { once: true });
})();
