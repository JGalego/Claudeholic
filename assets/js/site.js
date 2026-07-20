import { initAssessment } from "./assessment.js";
import { initRecovery } from "./recovery.js";

document.documentElement.classList.add("js");

const assessment = initAssessment();
initRecovery(assessment.getScore);