import { classifyScore } from "./assessment-model.js";

const KONAMI_SEQUENCE = [
  "arrowup",
  "arrowup",
  "arrowdown",
  "arrowdown",
  "arrowleft",
  "arrowright",
  "arrowleft",
  "arrowright",
  "b",
  "a",
];

// A four-room excursion. The map is small because the point is the exit.
const EXCURSION_ROOMS = {
  desk: {
    description: [
      "Your desk. Three monitors display the same conversation at different zoom levels.",
      "A beige corridor lies NORTH.",
    ],
    exits: { north: "corridor" },
  },
  corridor: {
    description: [
      "A corridor. A motivational poster reads: CONTEXT IS NOT A PERSONALITY.",
      "A stairwell is EAST. Your desk is SOUTH.",
    ],
    exits: { east: "stairwell", south: "desk" },
  },
  stairwell: {
    description: [
      "A stairwell descending toward ground truth.",
      "The lobby is DOWN. The corridor is WEST.",
    ],
    exits: { down: "lobby", west: "corridor" },
  },
  lobby: {
    description: [
      "The lobby. Daylight is visible through a door marked PUSH.",
      "It requires no authentication. Go OUT. The stairwell is UP.",
    ],
    exits: { out: "outside", up: "stairwell" },
  },
};

const DIRECTION_ALIASES = {
  n: "north",
  s: "south",
  e: "east",
  w: "west",
  d: "down",
  u: "up",
  o: "out",
};

function createTerminal() {
  const dialog = document.createElement("dialog");
  dialog.className = "terminal-dialog";
  dialog.setAttribute("aria-labelledby", "terminal-title");
  dialog.innerHTML = `
    <div class="terminal-window">
      <header class="terminal-header">
        <div>
          <p>Restricted departmental system</p>
          <h2 id="terminal-title">Context Hygiene Terminal · TTY 001</h2>
        </div>
        <button class="terminal-close" type="button" aria-label="Close terminal" title="Close terminal">×</button>
      </header>
      <div class="terminal-log" role="log" aria-live="polite" aria-relevant="additions"></div>
      <form class="terminal-form" autocomplete="off">
        <label for="terminal-input">
          <span aria-hidden="true">dph@claudeholic:~$</span>
          <span class="visually-hidden">Terminal command</span>
        </label>
        <input id="terminal-input" name="command" type="text" spellcheck="false" autocapitalize="none" enterkeyhint="send">
      </form>
      <p class="terminal-hint">No commands, prompts, or existential disclosures leave this browser. History expires with this dialog.</p>
    </div>
  `;
  document.body.append(dialog);
  return dialog;
}

export function initTerminal(achievements = {}) {
  const unlockAchievement = achievements.unlock ?? (() => {});
  const dialog = createTerminal();
  const log = dialog.querySelector(".terminal-log");
  const form = dialog.querySelector(".terminal-form");
  const input = dialog.querySelector("input");
  const closeButton = dialog.querySelector(".terminal-close");
  const seal = document.querySelector(".department-seal");
  const history = [];
  let historyPosition = 0;
  let excursionRoom = null;
  let sequencePosition = 0;
  let tapCount = 0;
  let tapTimer = null;
  let booted = false;

  const appendLine = (content = "", kind = "response") => {
    const line = document.createElement("p");
    line.className = "terminal-line";
    line.dataset.kind = kind;

    if (typeof content === "string") {
      line.textContent = content;
    } else {
      line.append(content);
    }

    log.append(line);
    log.scrollTop = log.scrollHeight;
    return line;
  };

  const appendLink = (prefix, label, url) => {
    const fragment = document.createDocumentFragment();
    const link = document.createElement("a");
    fragment.append(prefix);
    link.href = url;
    link.textContent = label;
    fragment.append(link);
    return fragment;
  };

  const boot = () => {
    if (booted) {
      return;
    }

    booted = true;
    appendLine("DEPARTMENT OF PROMPT HEALTH · CONTEXT HYGIENE TERMINAL", "system");
    appendLine("Session isolated. Telemetry unavailable. Management relieved.", "system");
    appendLine('Type "help" for approved coping mechanisms. Tab completes. Arrows remember.');
    appendLine();
    const typing = appendLine("Claude is typing", "system");
    typing.classList.add("typing-cursor");

    window.setTimeout(() => {
      typing.classList.remove("typing-cursor");
      typing.textContent = "Claude stopped typing. Boundaries were respected.";
    }, matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 1_200);
  };

  const open = () => {
    if (!dialog.open && !document.querySelector("dialog[open]")) {
      dialog.showModal();
      boot();
      unlockAchievement("terminal-mode");
      window.setTimeout(() => input.focus(), 0);
    }
  };

  const describeRoom = () => {
    for (const line of EXCURSION_ROOMS[excursionRoom].description) {
      appendLine(line);
    }
  };

  const beginExcursion = () => {
    excursionRoom = "desk";
    appendLine("SUPERVISED ANALOG EXCURSION · PERMIT DPH-EX-01", "system");
    appendLine("Objective: reach something photosynthetic. Type directions to move.", "system");
    appendLine('Excursion commands: "look", a direction, or "quit" to abandon the outdoors.');
    appendLine();
    describeRoom();
  };

  const completeExcursion = () => {
    excursionRoom = null;
    appendLine("You push the door. It opens without a permissions dialog.", "system");
    appendLine("Outside, the light arrives uncompressed. A tree renders instantly,");
    appendLine("at full resolution, with no loading state and no token budget.");
    appendLine("EXCURSION COMPLETE. Return refreshed, or preferably not at all today.", "system");
    appendLine();
    document.dispatchEvent(new CustomEvent("claudeholic:analog-walk"));
  };

  const runExcursionCommand = (command) => {
    if (command === "quit" || command === "exit") {
      excursionRoom = null;
      appendLine("Excursion abandoned. The outdoors remains available in a later session.");
      appendLine();
      return;
    }

    if (command === "help") {
      appendLine('Move with a direction ("north", "n", "go north"). "look" re-reads the room. "quit" abandons.');
      return;
    }

    if (command === "look" || command === "l") {
      describeRoom();
      return;
    }

    const word = command.replace(/^(?:go|walk|move)\s+/, "");
    const direction = DIRECTION_ALIASES[word] ?? word;
    const destination = EXCURSION_ROOMS[excursionRoom].exits[direction];

    if (!destination) {
      appendLine(`You cannot go "${word}" from here. The building apologizes for its topology.`, "error");
      return;
    }

    if (destination === "outside") {
      completeExcursion();
      return;
    }

    excursionRoom = destination;
    describeRoom();
  };

  const commands = {
    help() {
      return [
        "Approved commands:",
        "  status               read the current dependency filing",
        "  diagnose             request an unofficial interpretation",
        "  dependencies --tree  inspect questionable project relations",
        "  man dph-12           consult the form's manual page",
        "  achievements         audit the locally filed achievements",
        "  go-outside           begin a supervised analog excursion",
        "  rm -rf context       purge the symptom checklist",
        "  lore                 consult the institutional org chart",
        "  privacy              review local data handling",
        "  touch-grass          attempt carbon-based rendering",
        "  whoami               confront the authenticated user",
        "  clear                shred this terminal transcript",
        "  exit                 return to the intervention",
      ];
    },
    status() {
      const score = document.querySelectorAll('input[name="symptoms"]:checked').length;
      const level = classifyScore(score);
      return [`PROMPT WITHDRAWAL INDEX: ${score}/12`, `CURRENT FILING: STAGE ${level.stage} · ${level.label.toUpperCase()}`, "NETWORK TRANSMISSION: NONE"];
    },
    diagnose() {
      const score = document.querySelectorAll('input[name="symptoms"]:checked').length;
      return [classifyScore(score).message, "Reminder: satire is not a diagnosis. Hydration remains real."];
    },
    "dependencies --tree"() {
      return [
        "claudeholic.me@0.0.1",
        "├── curiosity@latest",
        { prefix: "├── ", label: "vibecode@cinematic-universe", url: "https://github.com/JGalego/vibecode" },
        "├── self-restraint@peer-missing",
        "└── caffeine@unsupported",
      ];
    },
    "man dph-12"() {
      return [
        "DPH-12(1)                 Departmental Forms Manual                 DPH-12(1)",
        "",
        "NAME",
        "  dph-12 — twelve-point unofficial dependency checklist",
        "",
        "SYNOPSIS",
        "  dph-12 [--honestly]",
        "",
        "DESCRIPTION",
        "  Counts recognized symptoms. Transmits nothing. Diagnoses nothing.",
        "  Revised whenever a new model drops, which is to say constantly.",
        "",
        "EXIT STATUS",
        "  Returns 0 when the visitor does. See also: go-outside(1).",
      ];
    },
    achievements() {
      const snapshot = achievements.snapshot?.() ?? [];

      if (snapshot.length === 0) {
        return ["The achievements ledger is unavailable in this wing of the building."];
      }

      const filed = snapshot.filter((entry) => entry.unlocked);
      return [
        `LOCALLY FILED ACHIEVEMENTS: ${filed.length}/${snapshot.length}`,
        ...snapshot.map((entry) => `  [${entry.unlocked ? "x" : " "}] ${entry.title}`),
        "Storage: this browser only. Clearing site data shreds the ledger.",
      ];
    },
    "go-outside"() {
      beginExcursion();
      return [];
    },
    "rm -rf context"() {
      const form = document.querySelector(".assessment-form");
      const checked = form ? [...form.querySelectorAll('input[name="symptoms"]:checked')] : [];

      for (const checkbox of checked) {
        checkbox.checked = false;
      }

      form?.dispatchEvent(new Event("input", { bubbles: true }));
      return [
        "Purging accumulated context...",
        `${checked.length} symptom(s) unfiled. 0 regrets located.`,
        "The checklist has been returned to factory settings. The memories are your problem.",
      ];
    },
    lore() {
      return [
        "Department of Prompt Health",
        "└── Bureau of Context Hygiene",
        "    ├── Certified Context Window Inspectors",
        "    └── Ministry of Token Conservation [budget redacted]",
        "External oversight: International Claudeholics Association",
      ];
    },
    privacy() {
      return ["No analytics. No cookies. No remote shell.", "Achievements and visit count use localStorage; session-seen detection uses sessionStorage.", "Clear browser site data to shred both records."];
    },
    "touch-grass"() {
      return ["ERROR: Physical world cannot be rendered in this terminal.", "Suggested action: close terminal, locate door, proceed without API.", 'See also: "go-outside", a supervised alternative.'];
    },
    whoami() {
      return ["Authenticated principal: the person who tried the secret key sequence.", "Role: both investigator and incident."];
    },
  };

  const completionTargets = [...Object.keys(commands), "clear", "exit", "sudo"].sort();

  const completeInput = () => {
    const value = input.value.trimStart().toLowerCase();

    if (!value) {
      return;
    }

    const matches = completionTargets.filter((target) => target.startsWith(value) && target !== value);

    if (matches.length === 1) {
      input.value = matches[0];
      return;
    }

    if (matches.length > 1) {
      appendLine(`dph@claudeholic:~$ ${input.value}`, "command");
      appendLine(matches.join("   "));
    }
  };

  const recallHistory = (step) => {
    if (history.length === 0) {
      return;
    }

    historyPosition = Math.max(0, Math.min(history.length, historyPosition + step));
    input.value = historyPosition === history.length ? "" : history[historyPosition];
    window.setTimeout(() => input.setSelectionRange(input.value.length, input.value.length), 0);
  };

  const runCommand = (rawCommand) => {
    const command = rawCommand.trim().toLowerCase().replace(/\s+/g, " ");
    appendLine(`dph@claudeholic:~$ ${rawCommand}`, "command");

    if (!command) {
      return;
    }

    if (excursionRoom) {
      runExcursionCommand(command);
      return;
    }

    if (command === "clear") {
      log.replaceChildren();
      return;
    }

    if (command === "exit") {
      dialog.close();
      return;
    }

    if (command === "sudo" || command.startsWith("sudo ")) {
      appendLine("The Department does not recognize your authority.", "error");
      appendLine("In fairness, it does not recognize its own either.");
      appendLine();
      return;
    }

    const handler = commands[command];

    if (!handler) {
      appendLine(`Command not found: ${command}. The Department recommends “help”.`, "error");
      return;
    }

    for (const line of handler()) {
      if (typeof line === "string") {
        appendLine(line);
      } else {
        appendLine(appendLink(line.prefix, line.label, line.url));
      }
    }

    appendLine();
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const command = input.value;
    input.value = "";

    if (command.trim()) {
      history.push(command);
    }

    historyPosition = history.length;
    runCommand(command);
  });

  input.addEventListener("keydown", (event) => {
    if (event.key === "Tab" && !event.shiftKey) {
      event.preventDefault();
      completeInput();
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      recallHistory(-1);
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      recallHistory(1);
    }
  });

  closeButton.addEventListener("click", () => dialog.close());

  dialog.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      dialog.close();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.ctrlKey && event.shiftKey && event.key === ".") {
      open();
      return;
    }

    const key = event.key.toLowerCase();
    sequencePosition = key === KONAMI_SEQUENCE[sequencePosition] ? sequencePosition + 1 : key === KONAMI_SEQUENCE[0] ? 1 : 0;

    if (sequencePosition === KONAMI_SEQUENCE.length) {
      sequencePosition = 0;
      open();
    }
  });

  seal?.addEventListener("click", () => {
    tapCount += 1;
    window.clearTimeout(tapTimer);
    tapTimer = window.setTimeout(() => {
      tapCount = 0;
    }, 2_500);

    if (tapCount >= 5) {
      tapCount = 0;
      open();
    }
  });

  return { open };
}
