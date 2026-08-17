import assert from "node:assert/strict";
import test from "node:test";

import { estimateTokens, inspectPrompt } from "../assets/js/inspection-model.js";

test("returns drafts that contain credential-shaped strings", () => {
  const inspection = inspectPrompt("Fix my build. My key is sk-live-4242424242424242abcdef.");

  assert.equal(inspection.verdict, "returned");
  assert.ok(inspection.findings.some((finding) => finding.severity === "redact"));
});

test("returns drafts that contain email addresses or secret assignments", () => {
  assert.equal(inspectPrompt("Reach me at sam@example.com if the tests fail.").verdict, "returned");
  assert.equal(inspectPrompt("Use password = hunter2 to log into staging.").verdict, "returned");
});

test("returns drafts that declare archives as context", () => {
  const inspection = inspectPrompt("I am attaching our entire repository. The question is at the end.");

  assert.equal(inspection.verdict, "returned");
  assert.ok(inspection.findings.some((finding) => finding.severity === "trim"));
});

test("returns drafts whose estimated tokens exceed plausible relevance", () => {
  const inspection = inspectPrompt("context ".repeat(1_500));

  assert.equal(inspection.verdict, "returned");
  assert.ok(inspection.tokens > 2_000);
});

test("approves specific, bounded, secret-free drafts", () => {
  const inspection = inspectPrompt("Explain the difference between TCP and UDP in two paragraphs.");

  assert.equal(inspection.verdict, "approved");
});

test("commends an explicit stopping condition", () => {
  const inspection = inspectPrompt("Review this function. Done means: a list of suspect lines. Stop after the list.");

  assert.equal(inspection.verdict, "approved");
  assert.ok(inspection.findings.some((finding) => finding.severity === "commendation"));
});

test("notes politeness without blocking approval", () => {
  const inspection = inspectPrompt("Please explain how DNS resolution works. Thanks!");

  assert.equal(inspection.verdict, "approved");
  assert.ok(inspection.findings.some((finding) => finding.title.includes("Politeness")));
});

test("treats an empty submission as the healthiest prompt of the day", () => {
  const inspection = inspectPrompt("   ");

  assert.equal(inspection.verdict, "approved");
  assert.equal(inspection.tokens, 0);
  assert.equal(inspection.characters, 0);
});

test("estimates tokens at roughly four characters each", () => {
  assert.equal(estimateTokens(""), 0);
  assert.equal(estimateTokens("abcd"), 1);
  assert.equal(estimateTokens("abcdefgh!"), 3);
});

test("every finding carries a severity, title, and detail", () => {
  const samples = ["", "hello", "password = hunter2", "context ".repeat(1_500)];

  for (const sample of samples) {
    for (const finding of inspectPrompt(sample).findings) {
      assert.ok(["redact", "trim", "note", "commendation"].includes(finding.severity));
      assert.ok(finding.title.length > 0);
      assert.ok(finding.detail.length > 0);
    }
  }
});
