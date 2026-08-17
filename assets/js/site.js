import { initAssessment } from "./assessment.js";
import { initAchievements } from "./achievements.js";
import { initCondition } from "./condition.js";
import { initPanicProtocol } from "./panic.js";
import { initRecovery } from "./recovery.js";
import { initReport } from "./report.js";
import { initTerminal } from "./terminal.js";

document.documentElement.classList.add("js");

const achievements = initAchievements();
initCondition();
const assessment = initAssessment();
initReport(assessment.getScore);
initRecovery(assessment.getScore);
initPanicProtocol();
initTerminal(achievements);