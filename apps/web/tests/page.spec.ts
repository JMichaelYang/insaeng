import { expect, test } from "@playwright/test";

test("snapshot /", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  const viewport = page.viewportSize();
  if (viewport) await page.mouse.move(viewport.width / 2, viewport.height / 2);
  await expect(page).toHaveScreenshot("index.png", { fullPage: true });
});
