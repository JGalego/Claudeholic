import assert from "node:assert/strict";
import test from "node:test";

import { PRESCRIPTIONS, prescriptionIndex } from "../assets/js/recovery.js";

test("prescriptions exist and remain modest", () => {
  assert.ok(PRESCRIPTIONS.length >= 7);

  for (const prescription of PRESCRIPTIONS) {
    assert.ok(prescription.length > 0);
  }
});

test("the same day and score always issue the same intervention", () => {
  const date = new Date("2026-08-17T12:00:00Z");

  assert.equal(prescriptionIndex(4, date), prescriptionIndex(4, date));
  assert.equal(prescriptionIndex(4, date), prescriptionIndex(4, new Date("2026-08-17T23:59:00Z")));
});

test("a new day or a new score may issue different paperwork", () => {
  const monday = new Date("2026-08-17T12:00:00Z");
  const tuesday = new Date("2026-08-18T12:00:00Z");

  assert.notEqual(prescriptionIndex(4, monday), prescriptionIndex(4, tuesday));
  assert.notEqual(prescriptionIndex(4, monday), prescriptionIndex(5, monday));
});

test("the index always points at a real prescription", () => {
  for (let score = 0; score <= 12; score += 1) {
    for (let day = 0; day < 14; day += 1) {
      const date = new Date(Date.UTC(2026, 7, 1 + day));
      const index = prescriptionIndex(score, date);
      assert.ok(Number.isInteger(index));
      assert.ok(index >= 0 && index < PRESCRIPTIONS.length);
    }
  }
});
