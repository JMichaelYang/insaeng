import { describe, expect, it } from "vitest";

import { wobblePill } from "../../src/utils/wobble-pill";

const wobble = { amplitude: 2, wavelength: 20 };

const points = (d: string) =>
  [...d.matchAll(/(-?[\d.]+) (-?[\d.]+)/g)].map(([, x, y]) => ({
    x: Number(x),
    y: Number(y),
  }));

describe("wobblePill", () => {
  it("returns nothing when the box is too small for the wobble", () => {
    expect(wobblePill({ width: 4, height: 4, wobble })).toBe("");
  });

  it("draws a closed outline that stays within the box", () => {
    const path = wobblePill({ width: 120, height: 48, wobble });
    expect(path.startsWith("M")).toBe(true);
    expect(path.endsWith("Z")).toBe(true);
    const pts = points(path);
    expect(pts.length).toBeGreaterThan(100);
    for (const p of pts) {
      expect(p.x).toBeGreaterThanOrEqual(-1e-6);
      expect(p.x).toBeLessThanOrEqual(120 + 1e-6);
      expect(p.y).toBeGreaterThanOrEqual(-1e-6);
      expect(p.y).toBeLessThanOrEqual(48 + 1e-6);
    }
  });

  it("wobbles away from a plain pill", () => {
    const pts = points(wobblePill({ width: 120, height: 48, wobble }));
    const top = pts.filter((p) => p.x > 40 && p.x < 80 && p.y < 10);
    expect(new Set(top.map((p) => p.y)).size).toBeGreaterThan(1);
  });

  it("joins the start and end without a seam", () => {
    const pts = points(wobblePill({ width: 120, height: 48, wobble }));
    const first = pts[0];
    const last = pts[pts.length - 1];
    expect(Math.hypot(first.x - last.x, first.y - last.y)).toBeLessThan(3);
  });
});
