import { expect, test } from "@playwright/test";

import { generateStaticParams } from "../../app/[section]/page";

for (const { section } of generateStaticParams()) {
  test(`snapshot /${section}`, async ({ page }) => {
    await page.goto(`/${section}`, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    const viewport = page.viewportSize();
    if (viewport) await page.mouse.move(viewport.width / 2, viewport.height / 2);
    await expect(page).toHaveScreenshot(`${section}.png`, { fullPage: true });
  });
}
