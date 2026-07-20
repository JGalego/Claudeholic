import { initAssessment } from "./assessment.js";
import { initAchievements } from "./achievements.js";
import { initPanicProtocol } from "./panic.js";
import { initRecovery } from "./recovery.js";

document.documentElement.classList.add("js");

initAchievements();
const assessment = initAssessment();
initRecovery(assessment.getScore);
initPanicProtocol();