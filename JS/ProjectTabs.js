const projectTabGroups = document.querySelectorAll("[data-project-tabs]");

projectTabGroups.forEach((group) => {
  const tabs = Array.from(group.querySelectorAll("[role='tab']"));
  const panels = Array.from(group.querySelectorAll("[role='tabpanel']"));

  function activateTab(nextTab) {
    tabs.forEach((tab) => {
      const isActive = tab === nextTab;
      const panel = panels.find((candidate) => candidate.id === tab.getAttribute("aria-controls"));

      tab.classList.toggle("is-active", isActive);
      tab.setAttribute("aria-selected", String(isActive));
      tab.tabIndex = isActive ? 0 : -1;

      if (panel) {
        panel.hidden = !isActive;
        panel.classList.toggle("is-active", isActive);
      }
    });

    nextTab.scrollIntoView({ block: "nearest", inline: "center" });
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => activateTab(tab));

    tab.addEventListener("keydown", (event) => {
      const keyToOffset = {
        ArrowLeft: -1,
        ArrowUp: -1,
        ArrowRight: 1,
        ArrowDown: 1,
      };

      if (!(event.key in keyToOffset)) {
        return;
      }

      event.preventDefault();
      const nextIndex = (index + keyToOffset[event.key] + tabs.length) % tabs.length;
      tabs[nextIndex].focus();
      activateTab(tabs[nextIndex]);
    });
  });
});
