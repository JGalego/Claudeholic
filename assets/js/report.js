import { createAssessmentReport } from "./assessment-model.js";

const CANONICAL_URL = "https://claudeholic.me/";

function utcDateSeed(date = new Date()) {
  return [date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate()]
    .map((part, index) => (index === 0 ? String(part) : String(part).padStart(2, "0")))
    .join("-");
}

function createDialog() {
  const dialog = document.createElement("dialog");
  dialog.className = "report-dialog";
  dialog.setAttribute("aria-labelledby", "report-title");
  dialog.innerHTML = `
    <div class="report-window">
      <header class="report-header">
        <div>
          <p>Department of Prompt Health · Form DPH-12A</p>
          <h2 id="report-title">Departmental assessment report</h2>
        </div>
        <button class="report-close" type="button" aria-label="Close assessment report" title="Close report">×</button>
      </header>

      <article class="report-document" aria-label="Accessible assessment report">
        <div class="report-docket">
          <p>Unofficial finding · Locally generated</p>
          <p data-report-case></p>
        </div>
        <div class="report-finding">
          <div>
            <p>Prompt Withdrawal Index</p>
            <strong>
              <span aria-hidden="true"><span data-report-score></span> / 12</span>
              <span class="visually-hidden" data-report-score-summary>0 out of 12</span>
            </strong>
          </div>
          <div>
            <p data-report-stage></p>
            <h3 data-report-label></h3>
          </div>
        </div>
        <section aria-labelledby="report-observation-title">
          <h4 id="report-observation-title">Departmental observation</h4>
          <p data-report-finding></p>
        </section>
        <section aria-labelledby="report-action-title">
          <h4 id="report-action-title">One recommended next step</h4>
          <p data-report-action></p>
        </section>
        <footer>
          <p>Generated locally. No symptom data was transmitted or placed in the URL.</p>
          <p>Satire, not a medical diagnosis.</p>
        </footer>
      </article>

      <div class="report-actions" aria-label="Report actions">
        <button type="button" data-report-copy><span aria-hidden="true">▣</span> Copy report text</button>
        <button type="button" data-report-download><span aria-hidden="true">↓</span> Download case card</button>
        <button type="button" data-report-share hidden><span aria-hidden="true">↗</span> Share report</button>
        <p data-report-status aria-live="polite"></p>
      </div>
    </div>
  `;
  document.body.append(dialog);
  return dialog;
}

export function wrapCanvasText(context, text, maximumWidth) {
  const words = text.split(/\s+/);
  const lines = [];
  let line = "";

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;

    if (context.measureText(candidate).width <= maximumWidth || !line) {
      line = candidate;
    } else {
      lines.push(line);
      line = word;
    }
  }

  if (line) {
    lines.push(line);
  }

  return lines;
}

export function drawSeal(context, centerX, centerY) {
  context.save();
  context.translate(centerX, centerY);
  context.rotate(-0.1);
  context.strokeStyle = "#a93f2d";
  context.fillStyle = "#a93f2d";
  context.lineWidth = 4;
  context.beginPath();
  context.arc(0, 0, 86, 0, Math.PI * 2);
  context.stroke();
  context.lineWidth = 2;
  context.beginPath();
  context.arc(0, 0, 72, 0, Math.PI * 2);
  context.stroke();
  context.font = '600 31px "IBM Plex Mono", monospace';
  context.textAlign = "center";
  context.fillText("DPH", 0, 10);
  context.font = '600 10px "IBM Plex Mono", monospace';
  context.fillText("CONTEXT HYGIENE", 0, 34);
  context.restore();
}

async function createReportBlob(report) {
  await document.fonts?.ready;

  const canvas = document.createElement("canvas");
  canvas.width = 1_200;
  canvas.height = 630;
  const context = canvas.getContext("2d");

  context.fillStyle = "#f3efe6";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = "rgba(23, 23, 20, 0.07)";
  context.lineWidth = 1;

  for (let position = 30; position < canvas.width; position += 48) {
    context.beginPath();
    context.moveTo(position, 0);
    context.lineTo(position, canvas.height);
    context.stroke();
  }

  for (let position = 30; position < canvas.height; position += 48) {
    context.beginPath();
    context.moveTo(0, position);
    context.lineTo(canvas.width, position);
    context.stroke();
  }

  context.strokeStyle = "#171714";
  context.lineWidth = 7;
  context.strokeRect(17, 17, 1_166, 596);
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(48, 112);
  context.lineTo(1_152, 112);
  context.stroke();

  context.fillStyle = "#171714";
  context.textAlign = "left";
  context.font = '600 22px "IBM Plex Mono", monospace';
  context.fillText("claudeholic.me", 48, 72);
  context.fillStyle = "#a93f2d";
  context.textAlign = "right";
  context.font = '600 16px "IBM Plex Mono", monospace';
  context.fillText(`CASE ${report.caseNumber}`, 1_152, 72);

  context.textAlign = "left";
  context.fillStyle = "#a93f2d";
  context.font = '600 16px "IBM Plex Mono", monospace';
  context.fillText("PROMPT WITHDRAWAL INDEX", 48, 160);
  context.font = '600 132px "IBM Plex Mono", monospace';
  context.fillText(String(report.score).padStart(2, "0"), 40, 292);
  context.font = '500 22px "IBM Plex Mono", monospace';
  context.fillText(`/ ${report.maximumScore}`, 218, 281);

  context.fillStyle = "#171714";
  context.font = '400 26px "IBM Plex Mono", monospace';
  context.fillText(`STAGE ${report.stage}`, 360, 164);
  context.font = '600 58px "Newsreader", Georgia, serif';
  const labelLines = wrapCanvasText(context, report.label, 570).slice(0, 2);
  labelLines.forEach((line, index) => context.fillText(line, 360, 225 + index * 58));

  context.strokeStyle = "#bcb4a5";
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(48, 340);
  context.lineTo(1_152, 340);
  context.stroke();

  context.fillStyle = "#245c45";
  context.font = '600 15px "IBM Plex Mono", monospace';
  context.fillText("RECOMMENDED NEXT STEP", 48, 390);
  context.fillStyle = "#171714";
  context.font = '400 33px "Newsreader", Georgia, serif';
  const actionLines = wrapCanvasText(context, report.guidance.action, 850).slice(0, 3);
  actionLines.forEach((line, index) => context.fillText(line, 48, 438 + index * 38));

  drawSeal(context, 1_035, 455);

  context.fillStyle = "#3f3e38";
  context.font = '400 13px "IBM Plex Mono", monospace';
  context.fillText("GENERATED LOCALLY · NO ANSWERS TRANSMITTED · NOT A MEDICAL DIAGNOSIS", 48, 584);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("The canvas declined to file the report."))), "image/png");
  });
}

async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.append(textarea);
  textarea.select();
  const copied = document.execCommand("copy");
  textarea.remove();

  if (!copied) {
    throw new Error("Clipboard access was declined.");
  }
}

function fillReport(dialog, report) {
  dialog.querySelector("[data-report-case]").textContent = `Case ${report.caseNumber}`;
  dialog.querySelector("[data-report-score]").textContent = String(report.score);
  dialog.querySelector("[data-report-score-summary]").textContent = `${report.score} out of ${report.maximumScore}`;
  dialog.querySelector("[data-report-stage]").textContent = `Stage ${report.stage}`;
  dialog.querySelector("[data-report-label]").textContent = report.label;
  dialog.querySelector("[data-report-finding]").textContent = report.finding;
  dialog.querySelector("[data-report-action]").textContent = report.guidance.action;
  dialog.querySelector("[data-report-status]").textContent = "";
}

export function initReport(getScore) {
  const resultPanel = document.querySelector(".result-panel");

  if (!resultPanel) {
    return;
  }

  const dialog = createDialog();
  const trigger = document.createElement("button");
  const resetButton = resultPanel.querySelector('button[type="reset"]');
  const closeButton = dialog.querySelector(".report-close");
  const copyButton = dialog.querySelector("[data-report-copy]");
  const downloadButton = dialog.querySelector("[data-report-download]");
  const shareButton = dialog.querySelector("[data-report-share]");
  const status = dialog.querySelector("[data-report-status]");
  let report = null;

  trigger.type = "button";
  trigger.className = "report-trigger";
  trigger.innerHTML = '<span aria-hidden="true">▤</span> Issue my assessment report';
  resetButton.insertAdjacentElement("beforebegin", trigger);

  const setStatus = (message, isError = false) => {
    status.textContent = message;
    status.dataset.state = isError ? "error" : "success";
  };

  trigger.addEventListener("click", () => {
    report = createAssessmentReport(getScore(), utcDateSeed());
    fillReport(dialog, report);
    dialog.showModal();
    closeButton.focus();
    document.dispatchEvent(new CustomEvent("claudeholic:report-opened", { detail: { score: report.score } }));
  });

  closeButton.addEventListener("click", () => dialog.close());
  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    dialog.close();
  });
  document.addEventListener("keydown", (event) => {
    if (!dialog.open) {
      return;
    }

    const openDialogs = [...document.querySelectorAll("dialog[open]")];

    if (event.key === "Escape" && openDialogs.at(-1) === dialog) {
      event.preventDefault();
      event.stopPropagation();
      dialog.close();
      return;
    }

    if (event.key === "Tab") {
      const controls = [...dialog.querySelectorAll("button:not([disabled]):not([hidden])")];
      const firstControl = controls.at(0);
      const lastControl = controls.at(-1);

      if (event.shiftKey && document.activeElement === firstControl) {
        event.preventDefault();
        lastControl.focus();
      } else if (!event.shiftKey && document.activeElement === lastControl) {
        event.preventDefault();
        firstControl.focus();
      } else if (!dialog.contains(document.activeElement)) {
        event.preventDefault();
        firstControl.focus();
      }
    }
  });
  dialog.addEventListener("close", () => trigger.focus());

  copyButton.addEventListener("click", async () => {
    try {
      await copyText(`${report.text}\n${CANONICAL_URL}`);
      setStatus("Report text copied. The clipboard has been notified.");
      document.dispatchEvent(new CustomEvent("claudeholic:report-copied"));
    } catch (error) {
      setStatus(error.message, true);
    }
  });

  downloadButton.addEventListener("click", async () => {
    const currentReport = report;
    downloadButton.disabled = true;
    setStatus("Rendering 1,200 × 630 pixels of administrative concern...");

    try {
      const blob = await createReportBlob(currentReport);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `claudeholic-${currentReport.caseNumber.toLowerCase()}.png`;
      link.click();
      URL.revokeObjectURL(url);
      setStatus("Case card downloaded. Store near other important paperwork.");
      document.dispatchEvent(new CustomEvent("claudeholic:report-downloaded"));
    } catch (error) {
      setStatus(error.message, true);
    } finally {
      downloadButton.disabled = false;
    }
  });

  if (navigator.share) {
    shareButton.hidden = false;
    shareButton.addEventListener("click", async () => {
      try {
        await navigator.share({
          title: `Claudeholic case ${report.caseNumber}`,
          text: report.text,
          url: CANONICAL_URL,
        });
        setStatus("Report released into the appropriate channels.");
      } catch (error) {
        if (error.name !== "AbortError") {
          setStatus("The share sheet declined the paperwork. Copying still works.", true);
        }
      }
    });
  }
}