// End-to-end smoke review: the interactive paperwork, exercised in a real browser.
import { expect, test } from "@playwright/test";

test("the assessment scores, stages, and reports locally", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/claudeholic\.me/);

  await page.getByLabel(/I paste errors before reading them/).check();
  await page.getByLabel(/I have opinions about context windows/).check();
  await expect(page.locator("#score")).toHaveText("2");
  await expect(page.locator("#stage-1")).toHaveAttribute("aria-current", "step");

  await page.getByRole("button", { name: /Issue my assessment report/ }).click();
  await expect(page.locator(".report-dialog")).toBeVisible();
  await expect(page.locator("[data-report-case]")).toContainText(/Case DPH-02-/);
});

test("the inspection desk returns a secretive draft and approves a clean one", async ({ page }) => {
  await page.goto("/");

  const input = page.locator("#inspection-input");
  await input.fill("My api key = sk-live-4242424242424242abcdef. Fix the CSS please.");
  await page.getByRole("button", { name: "Request inspection" }).click();
  await expect(page.locator("[data-inspection-stamp]")).toHaveText("RETURNED FOR REVISION");

  await input.fill("Explain the difference between TCP and UDP in two paragraphs.");
  await page.getByRole("button", { name: "Request inspection" }).click();
  await expect(page.locator("[data-inspection-stamp]")).toHaveText("APPROVED FOR TRANSMISSION");
});

test("the restricted terminal opens by shortcut and answers help", async ({ page }) => {
  await page.goto("/");

  await page.keyboard.press("Control+Shift+.");
  await expect(page.locator(".terminal-dialog")).toBeVisible();

  await page.locator("#terminal-input").fill("help");
  await page.keyboard.press("Enter");
  await expect(page.locator(".terminal-log")).toContainText("Approved commands:");
});

test("the paperwork palette requisitions the terminal", async ({ page }) => {
  await page.goto("/");

  await page.keyboard.press("Control+k");
  await expect(page.locator(".palette-dialog")).toBeVisible();

  await page.locator("#palette-input").fill("terminal");
  await page.keyboard.press("Enter");
  await expect(page.locator(".terminal-dialog")).toBeVisible();
});

test("the exam grants certification to a careful inspector", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: /Begin the examination/ }).click();
  const dialog = page.locator(".exam-dialog");
  await expect(dialog).toBeVisible();

  const decisions = ["return", "approve", "return", "approve", "return", "approve"];

  for (const decision of decisions) {
    const name = decision === "approve" ? "Stamp: APPROVED" : "Stamp: RETURN FOR REVISION";
    await dialog.getByRole("button", { name }).click();
    await dialog.getByRole("button", { name: /next exhibit|Receive the verdict/ }).click();
  }

  await expect(dialog.locator("[data-exam-verdict]")).toHaveText("CERTIFICATION GRANTED");
});
