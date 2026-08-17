// The paperwork requisition palette. Ctrl+K, because the Department respects muscle memory.
function createPalette() {
  const dialog = document.createElement("dialog");
  dialog.className = "palette-dialog";
  dialog.setAttribute("aria-labelledby", "palette-title");
  dialog.innerHTML = `
    <div class="palette-window">
      <h2 id="palette-title" class="visually-hidden">Paperwork requisition palette</h2>
      <form class="palette-form">
        <label for="palette-input">
          <span aria-hidden="true">▤</span>
          <span class="visually-hidden">Search paperwork actions</span>
        </label>
        <input
          id="palette-input"
          type="text"
          role="combobox"
          aria-expanded="true"
          aria-controls="palette-list"
          aria-autocomplete="list"
          placeholder="Requisition paperwork..."
          autocomplete="off"
          spellcheck="false"
        >
      </form>
      <ul class="palette-list" id="palette-list" role="listbox" aria-label="Available actions"></ul>
      <p class="palette-empty" hidden>No matching paperwork. The Department is as surprised as you are.</p>
      <p class="palette-footer">↑↓ navigate · Enter files · Esc abandons the request</p>
    </div>
  `;
  document.body.append(dialog);
  return dialog;
}

export function initPalette({ openTerminal = () => {} } = {}) {
  const dialog = createPalette();
  const form = dialog.querySelector(".palette-form");
  const input = dialog.querySelector("input");
  const list = dialog.querySelector(".palette-list");
  const emptyNote = dialog.querySelector(".palette-empty");

  const jump = (selector) => {
    const target = document.querySelector(selector);

    if (!target) {
      return;
    }

    target.scrollIntoView({ block: "start" });
    target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
  };

  const actions = [
    { label: "Go to: Dependency check", hint: "Form DPH-12", run: () => jump("#assessment") },
    { label: "Go to: Stages of Claudeholism", hint: "DSM-AI ladder", run: () => jump("#stages") },
    { label: "Go to: Recovery program", hint: "Seven steps, no streak", run: () => jump("#recovery") },
    { label: "Go to: Balance manifesto", hint: "Filed without irony", run: () => jump("#manifesto") },
    { label: "Go to: Context hygiene inspection", hint: "The desk is open", run: () => jump("#inspection") },
    { label: "Go to: Department bulletins", hint: "Public notices", run: () => jump("#bulletins") },
    { label: "Go to: Department records", hint: "Achievements and footnotes", run: () => jump("#records") },
    {
      label: "Issue my assessment report",
      hint: "Form DPH-12A",
      run: () => document.querySelector(".report-trigger")?.click(),
    },
    {
      label: "Issue today's prescription",
      hint: "One manageable intervention",
      run: () => {
        jump(".prescription");
        document.querySelector(".prescription button")?.click();
      },
    },
    {
      label: "Sit the inspector examination",
      hint: "Six exhibits, two stamps",
      run: () => document.querySelector("[data-exam-open]")?.click(),
    },
    { label: "Open the restricted terminal", hint: "TTY 001", run: () => openTerminal() },
    { label: "Print the paper edition", hint: "Form DPH-12, hard copy", run: () => window.print() },
    { label: "Open the bulletin archive", hint: "Leaves this page", run: () => window.location.assign("./bulletins/") },
    { label: "Review approved field notes", hint: "Leaves this page", run: () => window.location.assign("./field-notes/") },
  ];

  let filtered = actions;
  let activeIndex = 0;

  const render = () => {
    emptyNote.hidden = filtered.length > 0;
    input.setAttribute(
      "aria-activedescendant",
      filtered.length > 0 ? `palette-option-${activeIndex}` : "",
    );
    list.replaceChildren(
      ...filtered.map((action, index) => {
        const item = document.createElement("li");
        item.id = `palette-option-${index}`;
        item.setAttribute("role", "option");
        item.setAttribute("aria-selected", String(index === activeIndex));
        item.dataset.active = String(index === activeIndex);

        const label = document.createElement("span");
        label.textContent = action.label;

        const hint = document.createElement("small");
        hint.textContent = action.hint;

        item.append(label, hint);
        item.addEventListener("click", () => {
          dialog.close();
          action.run();
        });
        return item;
      }),
    );
  };

  const filter = () => {
    const query = input.value.trim().toLowerCase();
    filtered = query
      ? actions.filter((action) => `${action.label} ${action.hint}`.toLowerCase().includes(query))
      : actions;
    activeIndex = 0;
    render();
  };

  const open = () => {
    if (document.querySelector("dialog[open]")) {
      return;
    }

    input.value = "";
    filter();
    dialog.showModal();
    window.setTimeout(() => input.focus(), 0);
  };

  form.addEventListener("submit", (event) => event.preventDefault());

  input.addEventListener("input", filter);

  input.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      activeIndex = Math.min(filtered.length - 1, activeIndex + 1);
      render();
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      activeIndex = Math.max(0, activeIndex - 1);
      render();
    } else if (event.key === "Enter") {
      event.preventDefault();
      const action = filtered[activeIndex];

      if (action) {
        dialog.close();
        action.run();
      }
    }
  });

  document.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      open();
    }
  });

  return { open };
}
