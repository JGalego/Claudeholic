import "./theme.js";
import { initAssessment } from "./assessment.js";
import { initAchievements } from "./achievements.js";
import { initCensus } from "./census.js";
import { initCondition } from "./condition.js";
import { initExam } from "./exam.js";
import { initHistory } from "./history.js";
import { initInspection } from "./inspection.js";
import { initPalette } from "./palette.js";
import { initPanicProtocol } from "./panic.js";
import { initRecovery } from "./recovery.js";
import { initReport } from "./report.js";
import { initTerminal } from "./terminal.js";

document.documentElement.classList.add("js");

const achievements = initAchievements();
initCondition();
initHistory();
const assessment = initAssessment();
initReport(assessment.getScore);
initRecovery(assessment.getScore);
initInspection();
initCensus();
initExam(achievements.unlock);
initPanicProtocol();
const terminal = initTerminal(achievements);
initPalette({ openTerminal: terminal.open });

if ("serviceWorker" in navigator) {
  // Offline continuity: the intervention works without a connection. Claude does not.
  navigator.serviceWorker.register("./sw.js").catch(() => {
    // Registration declined (file:// viewing, private mode, or principle). All fine.
  });
}