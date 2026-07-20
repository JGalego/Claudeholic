import assert from "node:assert/strict";
import test from "node:test";

import {
  classifyScore,
  createAssessmentReport,
  MAXIMUM_SCORE,
} from "../assets/js/assessment-model.js";

test("maps every score boundary to the intended stage", () => {
  const cases = [
    [0, "0"],
    [1, "1"],
    [2, "1"],
    [3, "3"],
    [5, "3"],
    [6, "6"],
    [8, "6"],
    [9, "9"],
    [11, "9"],
    [12, "12"],
  ];

  for (const [score, stage] of cases) {
    assert.equal(classifyScore(score).stage, stage, `score ${score}`);
  }
});

test("clamps malformed and out-of-range scores", () => {
  assert.equal(classifyScore(-10).stage, "0");
  assert.equal(classifyScore(Number.NaN).stage, "0");
  assert.equal(classifyScore("not a score").stage, "0");
  assert.equal(classifyScore(MAXIMUM_SCORE + 100).stage, "12");
});

test("returns complete visitor-facing classifications", () => {
  for (let score = 0; score <= MAXIMUM_SCORE; score += 1) {
    const classification = classifyScore(score);
    assert.match(classification.stage, /^\d+$/);
    assert.ok(classification.label.length > 0);
    assert.ok(classification.message.length > 0);
    assert.ok(classification.guidance.title.length > 0);
    assert.equal(classification.guidance.steps.length, 3);
  }
});

test("creates stable local reports without encoding symptom details", () => {
  const first = createAssessmentReport(7, "2026-07-20");
  const second = createAssessmentReport(7, "2026-07-20");
  const nextDay = createAssessmentReport(7, "2026-07-21");

  assert.deepEqual(first, second);
  assert.notEqual(first.caseNumber, nextDay.caseNumber);
  assert.match(first.caseNumber, /^DPH-07-[A-Z0-9]{7}$/);
  assert.equal(first.score, 7);
  assert.equal(first.maximumScore, MAXIMUM_SCORE);
  assert.equal(first.stage, "6");
  assert.ok(first.text.includes("Generated locally"));
  assert.ok(!first.text.includes("symptom-"));
  assert.ok(!first.text.includes("?") && !first.text.includes("#"));
});

test("clamps report scores before creating public paperwork", () => {
  assert.equal(createAssessmentReport(-50).score, 0);
  assert.equal(createAssessmentReport(500).score, MAXIMUM_SCORE);
  assert.equal(createAssessmentReport("not a score").score, 0);
});