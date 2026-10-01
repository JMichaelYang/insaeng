import { readdirSync } from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";

const appDir = path.join(__dirname, "..", "app");
const isRouteGroup = (name: string) => /^\(.*\)$/.test(name);

// Every static route under app/, derived from page files.
function discoverRoutes(dir: string, segments: string[] = []): string[] {
  const routes: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const name = entry.name;
    if (entry.isFile() && /^page\.(tsx|ts|jsx|js|mdx)$/.test(name)) {
      routes.push("/" + segments.join("/"));
    } else if (entry.isDirectory()) {
      // Skip private folders, parallel/intercepted routes, and dynamic segments.
      if (/^[_@.\[]/.test(name)) continue;
      if (name.startsWith("(") && !isRouteGroup(name)) continue;
      // Route groups don't add a URL segment.
      const next = isRouteGroup(name) ? segments : [...segments, name];
      routes.push(...discoverRoutes(path.join(dir, name), next));
    }
  }
  return routes;
}

for (const route of discoverRoutes(appDir)) {
  test(`snapshot ${route}`, async ({ page }) => {
    await page.goto(route, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    const name = route === "/" ? "index" : route.slice(1).replaceAll("/", "-");
    await expect(page).toHaveScreenshot(`${name}.png`, { fullPage: true });
  });
}
