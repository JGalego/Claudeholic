import { initAssessment } from "./assessment.js";
import { initAchievements } from "./achievements.js";
import { initCondition } from "./condition.js";
import { initExam } from "./exam.js";
import { initHistory } from "./history.js";
import { initInspection } from "./inspection.js";
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
initExam(achievements.unlock);
initPanicProtocol();
initTerminal(achievements);