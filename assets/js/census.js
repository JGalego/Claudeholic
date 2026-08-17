import { classifyScore } from "./assessment-model.js";

// The one network request on the entire site, and it is same-origin, optional,
// user-initiated, and aggregate-only. The Department is very proud of this.
const STAGE_ORDER = ["0", "1", "3", "6", "9", "12"];

export function initCensus() {
  const host = document.querySelector("[data-census]");

  if (!host) {
    return;
  }

  const button = host.querySelector("[data-census-consult]");
  const results = host.querySelector("[data-census-results]");
  const status = host.querySelector("[data-census-status]");

  button.hidden = false;

  const currentStage = () => {
    const score = document.querySelectorAll('input[name="symptoms"]:checked').length;
    return classifyScore(score).stage;
  };

  const render = (census) => {
    const visitorStage = currentStage();
    const counts = STAGE_ORDER.map((stage) => Number(census.stages?.[stage]) || 0);
    const peak = Math.max(...counts, 1);
    const total = Number(census.totalReturns) || 0;

    const list = document.createElement("ol");
    list.className = "census-list";

    STAGE_ORDER.forEach((stage, index) => {
      const count = counts[index];
      const share = total > 0 ? Math.round((count / total) * 100) : 0;
      const item = document.createElement("li");
      item.dataset.current = String(stage === visitorStage);

      const label = document.createElement("span");
      label.className = "census-label";
      label.textContent = `Stage ${stage} · ${classifyScore(Number(stage)).label}${stage === visitorStage ? " (your current filing)" : ""}`;

      const bar = document.createElement("span");
      bar.className = "census-bar";
      bar.style.setProperty("--census-share", `${Math.max((count / peak) * 100, count > 0 ? 4 : 0)}%`);

      const figure = document.createElement("span");
      figure.className = "census-figure";
      figure.textContent = total > 0 ? `${count} · ${share}%` : "0";

      item.append(label, bar, figure);
      list.append(item);
    });

    const summary = document.createElement("p");
    summary.className = "census-summary";
    summary.textContent =
      total > 0
        ? `${total} public return(s) tallied · ledger dated ${census.updated} · respondents counted, never identified`
        : `No returns tallied yet (ledger dated ${census.updated}). The census office is patient in a way its subjects are not.`;

    results.replaceChildren(list, summary);
    status.textContent = "";
  };

  button.addEventListener("click", async () => {
    button.disabled = true;
    status.textContent = "Consulting the ledger. This is the site's only network request; savor it.";

    try {
      const response = await fetch("./data/census.json", { cache: "no-cache" });

      if (!response.ok) {
        throw new Error(`The ledger returned ${response.status}.`);
      }

      render(await response.json());
      button.textContent = "Consult the returns again";
    } catch {
      status.textContent = "The census office is unreachable. The static ledger remains available in the repository.";
    } finally {
      button.disabled = false;
    }
  });
}
