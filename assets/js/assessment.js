import { classifyScore, MAXIMUM_SCORE } from "./assessment-model.js";

export function initAssessment() {
  const form = document.querySelector(".assessment-form");

  if (!form) {
    return { getScore: () => 0 };
  }

  const checkboxes = [...form.querySelectorAll('input[name="symptoms"]')];
  const scoreValue = document.querySelector("#score");
  const scoreLabel = document.querySelector("#score-label");
  const meter = document.querySelector("#dependency-meter");
  const result = document.querySelector("#assessment-result");
  const resetButton = form.querySelector('button[type="reset"]');
  const stages = [...document.querySelectorAll(".stage-list [data-stage]")];

  const getScore = () => checkboxes.filter((checkbox) => checkbox.checked).length;

  const update = () => {
    const score = getScore();
    const level = classifyScore(score);

    scoreValue.textContent = String(score);
    scoreLabel.textContent = level.label;
    meter.value = score;
    meter.textContent = `${score} of ${MAXIMUM_SCORE}`;
    result.textContent = level.message;
    resetButton.disabled = score === 0;
    form.dataset.score = String(score);

    for (const stage of stages) {
      if (stage.dataset.stage === level.stage) {
        stage.setAttribute("aria-current", "step");
      } else {
        stage.removeAttribute("aria-current");
      }
    }

    document.dispatchEvent(
      new CustomEvent("claudeholic:score", {
        detail: { score, stage: level.stage },
      }),
    );
  };

  form.addEventListener("input", update);
  form.addEventListener("reset", () => requestAnimationFrame(update));
  update();

  return { getScore };
}