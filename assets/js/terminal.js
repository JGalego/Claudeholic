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
      <p class="terminal-hint">No commands, prompts, or existential disclosures leave this browser.</p>
    </div>
  `;
  document.body.append(dialog);
  return dialog;
}

export function initTerminal(unlockAchievement = () => {}) {
  const dialog = createTerminal();
  const log = dialog.querySelector(".terminal-log");
  const form = dialog.querySelector(".terminal-form");
  const input = dialog.querySelector("input");
  const closeButton = dialog.querySelector(".terminal-close");
  const seal = document.querySelector(".department-seal");
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
    appendLine('Type "help" for approved coping mechanisms.');
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

  const commands = {
    help() {
      return [
        "Approved commands:",
        "  status               read the current dependency filing",
        "  diagnose             request an unofficial interpretation",
        "  dependencies --tree  inspect questionable project relations",
        "  lore                 consult the institutional org chart",
        "  privacy              review local data handling",
        "  touch-grass          attempt carbon-based rendering",
        "  whoami               confront the authenticated user",
        "  clear                 shred this terminal transcript",
        "  exit                  return to the intervention",
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
      return ["ERROR: Physical world cannot be rendered in this terminal.", "Suggested action: close terminal, locate door, proceed without API."];
    },
    whoami() {
      return ["Authenticated principal: the person who tried the secret key sequence.", "Role: both investigator and incident."];
    },
  };

  const runCommand = (rawCommand) => {
    const command = rawCommand.trim().toLowerCase().replace(/\s+/g, " ");
    appendLine(`dph@claudeholic:~$ ${rawCommand}`, "command");

    if (!command) {
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
    runCommand(command);
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