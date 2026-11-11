// Types out the skills tab like a terminal the first time it opens
const SKILLS_CHAR_MIN_MS = 8;
const SKILLS_CHAR_MAX_MS = 20;
const SKILLS_WORD_PAUSE_MS = 32;
const SKILLS_OUTPUT_PAUSE_MS = 56;
const SKILLS_PROMPT_PAUSE_MS = 96;
const SKILLS_ENTER_PAUSE_MS = 96;

let skillsTypingRun = 0;
let skillsTypingPlayed = false;
let skillsCursor = null;

function typeSkills()
{
    const run = ++skillsTypingRun;
    const section = document.getElementById("skills");
    const groups = [...section.querySelectorAll(".skill-group")];
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    prepareForScreenReaders(section);
    const cursor = getCursor();

    const showAll = () =>
    {
        groups.forEach(group => setGroupShown(group, true));
        cursor.remove();
    };

    if (reduceMotion || skillsTypingPlayed)
    {
        showAll();
        return;
    }
    skillsTypingPlayed = true;

    groups.forEach(group => setGroupShown(group, false));

    // clicking or pressing a key skips the animation
    const skip = () =>
    {
        if (run !== skillsTypingRun) return;
        skillsTypingRun++;
        showAll();
    };
    const stopListening = () =>
    {
        section.removeEventListener("click", skip);
        document.removeEventListener("keydown", skip);
    };
    section.addEventListener("click", skip);
    document.addEventListener("keydown", skip);

    (async () =>
    {
        const stillCurrent = () => run === skillsTypingRun;

        for (const [i, group] of groups.entries())
        {
            if (i > 0)
            {
                await wait(SKILLS_OUTPUT_PAUSE_MS);
                if (!stillCurrent()) return stopListening();
            }

            const command = group.querySelector(".prompt-command");
            command.textContent = "";
            group.hidden = false;
            moveCursor(cursor, command.parentElement, false);

            await wait(SKILLS_PROMPT_PAUSE_MS);
            if (!stillCurrent()) return stopListening();

            cursor.classList.add("typing");
            if (!await typeText(command, run)) return stopListening();
            cursor.classList.remove("typing");

            await wait(SKILLS_ENTER_PAUSE_MS);
            if (!stillCurrent()) return stopListening();

            group.querySelector(".skill-list").hidden = false;
        }

        cursor.remove();
        stopListening();
    })();
}

function setGroupShown(group, shown)
{
    group.hidden = !shown;
    group.querySelector(".skill-list").hidden = !shown;
    group.querySelector(".prompt-command").textContent = cachedText(group.querySelector(".prompt-command"));
}

function getCursor()
{
    if (!skillsCursor)
    {
        skillsCursor = document.createElement("span");
        skillsCursor.className = "terminal-cursor";
        skillsCursor.setAttribute("aria-hidden", "true");
    }
    return skillsCursor;
}

function moveCursor(cursor, promptLine, typing)
{
    cursor.classList.toggle("typing", typing);
    promptLine.appendChild(cursor);
}

// screen readers get the full command instead of each typed letter
function prepareForScreenReaders(section)
{
    section.querySelectorAll(".prompt-command").forEach(command =>
    {
        if (command.hasAttribute("aria-hidden")) return;
        const label = document.createElement("span");
        label.className = "visually-hidden";
        label.textContent = cachedText(command);
        command.setAttribute("aria-hidden", "true");
        command.after(label);
    });
}

function cachedText(el)
{
    if (!el.dataset.text) el.dataset.text = el.textContent;
    return el.dataset.text;
}

async function typeText(el, run)
{
    const text = cachedText(el);

    el.textContent = "";
    for (let i = 1; i <= text.length; i++)
    {
        if (run !== skillsTypingRun) return false;
        el.textContent = text.slice(0, i);

        const char = text[i - 1];
        let delay = SKILLS_CHAR_MIN_MS + Math.random() * (SKILLS_CHAR_MAX_MS - SKILLS_CHAR_MIN_MS);
        if (char === " " || char === "/") delay += SKILLS_WORD_PAUSE_MS;
        await wait(delay);
    }
    return run === skillsTypingRun;
}

function wait(ms)
{
    return new Promise(resolve => setTimeout(resolve, ms));
}
