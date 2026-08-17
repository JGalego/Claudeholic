// The page itself is a witness. As symptoms accumulate, the paperwork reacts.
const STATUS_BY_STAGE = {
  0: "still typing",
  1: "politely returning",
  3: "drafting a preamble",
  6: "acquiring integrations",
  9: "archiving context",
  12: "maximum context",
};

const PROGNOSIS_BY_STAGE = {
  0: "Probably fine. Hydrate.",
  1: "Fine. Mind the anthropomorphism.",
  3: "Stable. The preamble is not.",
  6: "Guarded. Eleven tabs observed.",
  9: "Concerning. A token counter is crying.",
  12: "Paperwork exhausted. Go outside.",
};

export function initCondition() {
  const status = document.querySelector("[data-condition-status]");
  const prognosis = document.querySelector("[data-condition-prognosis]");
  const seal = document.querySelector(".department-seal");

  document.addEventListener("claudeholic:score", (event) => {
    const { score, stage } = event.detail;

    document.body.dataset.condition = stage;

    if (status) {
      status.textContent = STATUS_BY_STAGE[stage] ?? STATUS_BY_STAGE[0];
    }

    if (prognosis) {
      prognosis.textContent = PROGNOSIS_BY_STAGE[stage] ?? PROGNOSIS_BY_STAGE[0];
    }

    // One degree of additional lean per filed symptom. The seal is tired too.
    seal?.style.setProperty("--seal-tilt", `${score * -1}deg`);
  });
}
