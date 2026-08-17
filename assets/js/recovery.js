export const PRESCRIPTIONS = [
  "Close one browser tab. Not the important one. Start with the tab you cannot identify.",
  "Read one page of the primary documentation before asking for a summary.",
  "Write the next function unaided. You may complain quietly while doing so.",
  "Ask a human what they think. Allow enough time for an inconvenient answer.",
  "Remove one secret from a prompt before it becomes an incident report.",
  "Verify one confident claim against a source that existed before this conversation.",
  "Spend ten minutes on a hobby with no version number.",
];

export function prescriptionIndex(score, date = new Date()) {
  const dayKey = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) / 86_400_000;
  return Math.abs(dayKey + score) % PRESCRIPTIONS.length;
}

export function initRecovery(getScore) {
  const protocolList = document.querySelector(".protocol-list");

  if (!protocolList) {
    return;
  }

  const prescription = document.createElement("section");
  prescription.className = "prescription";
  prescription.setAttribute("aria-labelledby", "prescription-title");
  prescription.innerHTML = `
    <div>
      <h3 id="prescription-title">Today's modest prescription</h3>
      <p>Calibrated to your current level of disclosed denial.</p>
    </div>
    <button type="button">Issue one manageable intervention</button>
    <output aria-live="polite">No paperwork issued yet.</output>
  `;

  const button = prescription.querySelector("button");
  const output = prescription.querySelector("output");

  button.addEventListener("click", () => {
    output.textContent = PRESCRIPTIONS[prescriptionIndex(getScore())];
    button.textContent = "Issue a different-looking same-day intervention";
    document.dispatchEvent(new CustomEvent("claudeholic:prescription"));
  });

  protocolList.insertAdjacentElement("afterend", prescription);
}