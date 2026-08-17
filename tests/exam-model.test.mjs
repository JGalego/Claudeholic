import assert from "node:assert/strict";
import test from "node:test";

import { EXHIBITS, PASS_MARK, gradeExam } from "../assets/js/exam-model.js";

test("every exhibit is a complete, stampable filing", () => {
  assert.ok(EXHIBITS.length >= 6);

  const ids = new Set();

  for (const exhibit of EXHIBITS) {
    assert.match(exhibit.id, /^EXH-\d{2}$/);
    assert.ok(!ids.has(exhibit.id), `duplicate exhibit ${exhibit.id}`);
    ids.add(exhibit.id);
    assert.ok(exhibit.prompt.length > 0);
    assert.ok(["approve", "return"].includes(exhibit.correct));
    assert.ok(exhibit.rationale.length > 0);
  }
});

test("the exhibits test both stamps", () => {
  assert.ok(EXHIBITS.some((exhibit) => exhibit.correct === "approve"));
  assert.ok(EXHIBITS.some((exhibit) => exhibit.correct === "return"));
});

test("a perfect candidate is certified", () => {
  const result = gradeExam(EXHIBITS.map((exhibit) => exhibit.correct));

  assert.equal(result.score, EXHIBITS.length);
  assert.equal(result.passed, true);
});

test("a contrarian candidate is deferred", () => {
  const result = gradeExam(EXHIBITS.map((exhibit) => (exhibit.correct === "approve" ? "return" : "approve")));

  assert.equal(result.score, 0);
  assert.equal(result.passed, false);
});

test("the pass mark is enforced at the boundary", () => {
  const answers = EXHIBITS.map((exhibit) => exhibit.correct);
  const boundaryMisses = EXHIBITS.length - PASS_MARK;

  for (let index = 0; index < boundaryMisses; index += 1) {
    answers[index] = answers[index] === "approve" ? "return" : "approve";
  }

  const atMark = gradeExam(answers);
  assert.equal(atMark.score, PASS_MARK);
  assert.equal(atMark.passed, true);

  answers[boundaryMisses] = answers[boundaryMisses] === "approve" ? "return" : "approve";
  const belowMark = gradeExam(answers);
  assert.equal(belowMark.score, PASS_MARK - 1);
  assert.equal(belowMark.passed, false);
});

test("missing answers are graded as incorrect, not as errors", () => {
  const result = gradeExam([]);

  assert.equal(result.score, 0);
  assert.equal(result.passed, false);
  assert.equal(result.graded.length, EXHIBITS.length);
});
