// Fades in each tab's content from top to bottom the first time it opens
const REVEAL_STAGGER_MS = 70;
const REVEAL_FADE_MS = 250;

const REVEAL_UNITS = [
    "section > h2",
    "section > h3",
    ".subsection > h2",
    ".overview-text > h2",
    ".overview-text > p",
    ".about-photo",
    ".subsection > p",
    ".project-display > *",
    "#game-jam-display > *",
].join(", ");

const revealPlayed = new Set();
let revealRun = 0;
let finishReveal = null;

function revealSection(section)
{
    if (finishReveal) finishReveal();

    if (section.id === "skills" || revealPlayed.has(section.id)) return;
    revealPlayed.add(section.id);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const run = ++revealRun;
    const units = [...section.querySelectorAll(REVEAL_UNITS)];
    const stillCurrent = () => run === revealRun;

    units.forEach(unit => unit.classList.add("reveal-hidden"));

    // clicking or pressing a key skips the animation
    const finish = () =>
    {
        if (!stillCurrent()) return;
        revealRun++;
        finishReveal = null;
        section.removeEventListener("click", finish);
        document.removeEventListener("keydown", finish);
        units.forEach(unit => unit.classList.remove("reveal-hidden"));
    };
    finishReveal = finish;
    section.addEventListener("click", finish);
    document.addEventListener("keydown", finish);

    (async () =>
    {
        for (const [i, unit] of units.entries())
        {
            if (i > 0) await wait(REVEAL_STAGGER_MS);
            if (!stillCurrent()) return;
            fadeIn(unit);
        }
        await wait(REVEAL_FADE_MS);
        finish();
    })();
}

function fadeIn(el)
{
    el.classList.add("reveal-fade");
    el.classList.remove("reveal-hidden");
    setTimeout(() => el.classList.remove("reveal-fade"), REVEAL_FADE_MS + 50);
}
