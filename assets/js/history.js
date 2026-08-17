// The condition, longitudinally. One coarse number per day, kept in this browser only.
const HISTORY_KEY = "claudeholic.history.v1";
const MAXIMUM_ENTRIES = 60;
const MAXIMUM_SCORE = 12;
const SVG_NS = "http://www.w3.org/2000/svg";

function utcDay(date = new Date()) {
  return [
    String(date.getUTCFullYear()),
    String(date.getUTCMonth() + 1).padStart(2, "0"),
    String(date.getUTCDate()).padStart(2, "0"),
  ].join("-");
}

function readHistory() {
  try {
    const stored = JSON.parse(localStorage.getItem(HISTORY_KEY));
    return Array.isArray(stored)
      ? stored.filter((entry) => typeof entry?.d === "string" && Number.isInteger(entry?.s))
      : [];
  } catch {
    return [];
  }
}

function writeHistory(entries) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(entries.slice(-MAXIMUM_ENTRIES)));
  } catch {
    // Longitudinal study cancelled by privacy settings. A fine outcome.
  }
}

export function initHistory() {
  const section = document.querySelector("[data-history-record]");

  if (!section) {
    return;
  }

  const empty = section.querySelector("[data-history-empty]");
  const chartHost = section.querySelector("[data-history-chart]");
  const clearButton = section.querySelector("[data-history-clear]");
  let entries = readHistory();

  const render = () => {
    const hasData = entries.length > 0;
    empty.hidden = hasData;
    chartHost.hidden = !hasData;
    clearButton.hidden = !hasData;

    if (!hasData) {
      chartHost.replaceChildren();
      return;
    }

    const width = 600;
    const height = 120;
    const inset = 14;
    const latest = entries.at(-1);
    const peak = entries.reduce((maximum, entry) => Math.max(maximum, entry.s), 0);
    const xAt = (index) =>
      entries.length === 1 ? width / 2 : inset + (index * (width - inset * 2)) / (entries.length - 1);
    const yAt = (score) => height - inset - (score / MAXIMUM_SCORE) * (height - inset * 2);

    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    svg.setAttribute("role", "img");
    svg.setAttribute(
      "aria-label",
      `Prompt Withdrawal Index over ${entries.length} recorded day(s). Latest: ${latest.s} of ${MAXIMUM_SCORE}. Peak: ${peak} of ${MAXIMUM_SCORE}.`,
    );

    const baseline = document.createElementNS(SVG_NS, "line");
    baseline.setAttribute("x1", String(inset));
    baseline.setAttribute("x2", String(width - inset));
    baseline.setAttribute("y1", String(yAt(0)));
    baseline.setAttribute("y2", String(yAt(0)));
    baseline.setAttribute("class", "history-baseline");
    svg.append(baseline);

    const ceiling = baseline.cloneNode();
    ceiling.setAttribute("y1", String(yAt(MAXIMUM_SCORE)));
    ceiling.setAttribute("y2", String(yAt(MAXIMUM_SCORE)));
    ceiling.setAttribute("class", "history-ceiling");
    svg.append(ceiling);

    if (entries.length > 1) {
      const line = document.createElementNS(SVG_NS, "polyline");
      line.setAttribute(
        "points",
        entries.map((entry, index) => `${xAt(index).toFixed(1)},${yAt(entry.s).toFixed(1)}`).join(" "),
      );
      line.setAttribute("class", "history-line");
      svg.append(line);
    }

    const dot = document.createElementNS(SVG_NS, "circle");
    dot.setAttribute("cx", xAt(entries.length - 1).toFixed(1));
    dot.setAttribute("cy", yAt(latest.s).toFixed(1));
    dot.setAttribute("r", "4");
    dot.setAttribute("class", "history-dot");
    svg.append(dot);

    const caption = document.createElement("p");
    caption.className = "history-caption";
    caption.textContent = `${entries.length} day(s) on record · latest ${latest.s}/${MAXIMUM_SCORE} · peak ${peak}/${MAXIMUM_SCORE} · stored only here`;

    chartHost.replaceChildren(svg, caption);
  };

  document.addEventListener("claudeholic:score", (event) => {
    const today = utcDay();
    const score = event.detail.score;
    const existing = entries.find((entry) => entry.d === today);

    if (existing) {
      if (score <= existing.s) {
        return;
      }

      existing.s = score;
    } else {
      entries.push({ d: today, s: score });
      entries = entries.slice(-MAXIMUM_ENTRIES);
    }

    writeHistory(entries);
    render();
  });

  clearButton.addEventListener("click", () => {
    entries = [];

    try {
      localStorage.removeItem(HISTORY_KEY);
    } catch {
      // The shredder jammed silently. The render below still empties the room.
    }

    render();
  });

  render();
}
