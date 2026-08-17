import { inspectPrompt } from "./inspection-model.js";

const SEVERITY_LABELS = {
  redact: "Redact",
  trim: "Trim",
  note: "Note",
  commendation: "Commended",
};

const SPECIMENS = [
  "Hey! Please fix my login bug. My api key = sk-live-4242424242424242abcdef if you need it, and you can reach me at sam@example.com. Do whatever you think is best, thanks!!",
  "You are a world-class senior staff principal engineer. Before answering, consider the entire repository, my dissertation, and three podcast transcripts. The actual question appears near the end.",
  "Summarize this RFC in five bullets. Done means: five bullets, no adjectives, and links to the sections you used. Stop after that.",
];

export function initInspection() {
  const form = document.querySelector(".inspection-form");

  if (!form) {
    return;
  }

  const input = form.querySelector("#inspection-input");
  const sampleButton = form.querySelector("[data-inspection-sample]");
  const report = form.querySelector(".inspection-report");
  const stamp = form.querySelector("[data-inspection-stamp]");
  const meta = form.querySelector("[data-inspection-meta]");
  const findingsList = form.querySelector("[data-inspection-findings]");
  let specimenIndex = 0;

  const render = (inspection) => {
    report.hidden = false;
    stamp.textContent = inspection.verdict === "approved" ? "APPROVED FOR TRANSMISSION" : "RETURNED FOR REVISION";
    stamp.dataset.verdict = inspection.verdict;
    meta.textContent = `Estimated ${inspection.tokens.toLocaleString("en-US")} token(s) · ${inspection.characters.toLocaleString("en-US")} character(s) · inspected locally`;
    findingsList.replaceChildren(
      ...inspection.findings.map((finding) => {
        const item = document.createElement("li");
        item.dataset.severity = finding.severity;

        const label = document.createElement("strong");
        label.textContent = `${SEVERITY_LABELS[finding.severity] ?? finding.severity} · ${finding.title}.`;

        const detail = document.createElement("span");
        detail.textContent = ` ${finding.detail}`;

        item.append(label, detail);
        return item;
      }),
    );
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const inspection = inspectPrompt(input.value);
    render(inspection);
    document.dispatchEvent(
      new CustomEvent("claudeholic:inspection", {
        detail: { verdict: inspection.verdict, tokens: inspection.tokens },
      }),
    );
  });

  sampleButton?.addEventListener("click", () => {
    input.value = SPECIMENS[specimenIndex % SPECIMENS.length];
    specimenIndex += 1;
    form.requestSubmit();
  });
}
