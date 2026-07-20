import { initAssessment } from "./assessment.js";
import { initAchievements } from "./achievements.js";
import { initPanicProtocol } from "./panic.js";
import { initRecovery } from "./recovery.js";
import { initTerminal } from "./terminal.js";

document.documentElement.classList.add("js");

const achievements = initAchievements();
const assessment = initAssessment();
initRecovery(assessment.getScore);
initPanicProtocol();
initTerminal(achievements.unlock);