import { EXHIBITS, PASS_MARK, gradeExam } from "./exam-model.js";
import { drawSeal, wrapCanvasText } from "./report.js";

function utcSerial(date = new Date()) {
  return [
    String(date.getUTCFullYear()),
    String(date.getUTCMonth() + 1).padStart(2, "0"),
    String(date.getUTCDate()).padStart(2, "0"),
  ].join("");
}

function createExamDialog() {
  const dialog = document.createElement("dialog");
  dialog.className = "exam-dialog";
  dialog.setAttribute("aria-labelledby", "exam-title");
  dialog.innerHTML = `
    <div class="exam-window">
      <header class="report-header">
        <div>
          <p>Bureau of Context Hygiene · Personnel division</p>
          <h2 id="exam-title">Context Window Inspector examination</h2>
        </div>
        <button class="report-close" type="button" aria-label="Close examination" title="Close examination">×</button>
      </header>

      <div class="exam-body">
        <p class="exam-progress" data-exam-progress></p>
        <blockquote class="exam-exhibit"><p data-exam-exhibit></p></blockquote>
        <div class="exam-actions">
          <button type="button" data-exam-stamp="approve">Stamp: APPROVED</button>
          <button type="button" data-exam-stamp="return">Stamp: RETURN FOR REVISION</button>
        </div>
        <p class="exam-feedback" data-exam-feedback aria-live="polite"></p>
        <button type="button" class="exam-next" data-exam-next hidden>Present the next exhibit</button>

        <div class="exam-result" data-exam-result hidden>
          <p class="inspection-stamp" data-exam-verdict></p>
          <p data-exam-summary></p>
          <div class="exam-result-actions">
            <button type="button" data-exam-certificate hidden><span aria-hidden="true">↓</span> Download inspector certificate</button>
            <button type="button" data-exam-retake>Retake the examination</button>
          </div>
          <p data-exam-status aria-live="polite"></p>
        </div>

        <p class="exam-note">Graded locally. Answers are not stored. The credential confers no authority anywhere, including here.</p>
      </div>
    </div>
  `;
  document.body.append(dialog);
  return dialog;
}

async function createCertificateBlob(result) {
  await document.fonts?.ready;

  const canvas = document.createElement("canvas");
  canvas.width = 1_200;
  canvas.height = 630;
  const context = canvas.getContext("2d");

  context.fillStyle = "#f3efe6";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = "#171714";
  context.lineWidth = 7;
  context.strokeRect(17, 17, 1_166, 596);
  context.lineWidth = 1;
  context.strokeRect(34, 34, 1_132, 562);

  context.fillStyle = "#a93f2d";
  context.textAlign = "center";
  context.font = '600 16px "IBM Plex Mono", monospace';
  context.fillText("DEPARTMENT OF PROMPT HEALTH · BUREAU OF CONTEXT HYGIENE", 600, 92);

  context.fillStyle = "#171714";
  context.font = '600 58px "Newsreader", Georgia, serif';
  context.fillText("Certificate of Inspection", 600, 175);

  context.font = '400 24px "Newsreader", Georgia, serif';
  context.fillText("This certifies that the bearer, having stamped six exhibits", 600, 240);
  context.fillText("with unusual composure, is recognized as a", 600, 274);

  context.fillStyle = "#245c45";
  context.font = '600 40px "Newsreader", Georgia, serif';
  context.fillText("Certified Context Window Inspector", 600, 340);

  context.fillStyle = "#171714";
  context.font = '500 20px "IBM Plex Mono", monospace';
  context.fillText(`EXAMINATION SCORE: ${result.score}/${result.total}`, 600, 398);
  context.font = '400 16px "IBM Plex Mono", monospace';
  context.fillText(`SERIAL DPH-CWI-${utcSerial()} · VALID NOWHERE · RENEWED BY HYDRATION`, 600, 432);

  drawSeal(context, 990, 500);

  context.fillStyle = "#3f3e38";
  context.textAlign = "left";
  context.font = '400 13px "IBM Plex Mono", monospace';
  const footer = wrapCanvasText(context, "ISSUED LOCALLY BY CLAUDEHOLIC.ME · SATIRE, NOT A CREDENTIAL, DIAGNOSIS, OR ENDORSEMENT", 700);
  footer.forEach((line, index) => context.fillText(line, 48, 560 + index * 18));

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("The canvas declined to certify anyone today."))), "image/png");
  });
}

export function initExam(unlockAchievement = () => {}) {
  const openButton = document.querySelector("[data-exam-open]");

  if (!openButton) {
    return;
  }

  const dialog = createExamDialog();
  const closeButton = dialog.querySelector(".report-close");
  const progress = dialog.querySelector("[data-exam-progress]");
  const exhibitText = dialog.querySelector("[data-exam-exhibit]");
  const stampButtons = [...dialog.querySelectorAll("[data-exam-stamp]")];
  const feedback = dialog.querySelector("[data-exam-feedback]");
  const nextButton = dialog.querySelector("[data-exam-next]");
  const resultPanel = dialog.querySelector("[data-exam-result]");
  const verdict = dialog.querySelector("[data-exam-verdict]");
  const summary = dialog.querySelector("[data-exam-summary]");
  const certificateButton = dialog.querySelector("[data-exam-certificate]");
  const retakeButton = dialog.querySelector("[data-exam-retake]");
  const status = dialog.querySelector("[data-exam-status]");
  let answers = [];
  let position = 0;
  let result = null;

  openButton.hidden = false;

  const presentExhibit = () => {
    const exhibit = EXHIBITS[position];
    progress.textContent = `Exhibit ${position + 1} of ${EXHIBITS.length} · ${exhibit.id}`;
    exhibitText.textContent = `“${exhibit.prompt}”`;
    feedback.textContent = "";
    delete feedback.dataset.state;
    nextButton.hidden = true;
    resultPanel.hidden = true;

    for (const button of stampButtons) {
      button.disabled = false;
      button.hidden = false;
    }
  };

  const presentResult = () => {
    result = gradeExam(answers);
    progress.textContent = "Examination complete";
    exhibitText.textContent = "The exhibits rest. The stamps are returned to the drawer.";
    nextButton.hidden = true;

    for (const button of stampButtons) {
      button.hidden = true;
    }

    resultPanel.hidden = false;
    verdict.textContent = result.passed ? "CERTIFICATION GRANTED" : "CERTIFICATION DEFERRED";
    verdict.dataset.verdict = result.passed ? "approved" : "returned";
    summary.textContent = result.passed
      ? `${result.score} of ${result.total} exhibits stamped correctly. You may now inspect context windows you were already inspecting.`
      : `${result.score} of ${result.total} exhibits stamped correctly. A pass requires ${PASS_MARK}. The Bureau recommends re-reading the recovery program, then returning.`;
    certificateButton.hidden = !result.passed;
    status.textContent = "";

    if (result.passed) {
      unlockAchievement("certified-inspector");
      document.dispatchEvent(new CustomEvent("claudeholic:exam-passed", { detail: { score: result.score } }));
    }
  };

  const beginExam = () => {
    answers = [];
    position = 0;
    result = null;
    presentExhibit();
  };

  openButton.addEventListener("click", () => {
    beginExam();
    dialog.showModal();
    closeButton.focus();
  });

  for (const button of stampButtons) {
    button.addEventListener("click", () => {
      const exhibit = EXHIBITS[position];
      const answer = button.dataset.examStamp;
      answers.push(answer);

      const wasCorrect = answer === exhibit.correct;
      feedback.textContent = `${wasCorrect ? "Correctly stamped." : "The Bureau disagrees."} ${exhibit.rationale}`;
      feedback.dataset.state = wasCorrect ? "correct" : "incorrect";

      for (const stampButton of stampButtons) {
        stampButton.disabled = true;
      }

      nextButton.hidden = false;
      nextButton.textContent = position + 1 < EXHIBITS.length ? "Present the next exhibit" : "Receive the verdict";
      nextButton.focus();
    });
  }

  nextButton.addEventListener("click", () => {
    position += 1;

    if (position < EXHIBITS.length) {
      presentExhibit();
    } else {
      presentResult();
    }
  });

  retakeButton.addEventListener("click", beginExam);

  certificateButton.addEventListener("click", async () => {
    certificateButton.disabled = true;
    status.textContent = "Rendering a credential with no legal standing...";

    try {
      const blob = await createCertificateBlob(result);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `claudeholic-inspector-certificate-dph-cwi-${utcSerial()}.png`;
      link.click();
      URL.revokeObjectURL(url);
      status.textContent = "Certificate downloaded. Display it near other fictional accolades.";
    } catch (error) {
      status.textContent = error.message;
    } finally {
      certificateButton.disabled = false;
    }
  });

  closeButton.addEventListener("click", () => dialog.close());
}
