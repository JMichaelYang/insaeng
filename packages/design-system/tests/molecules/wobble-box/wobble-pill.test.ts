import { describe, expect, it } from "vitest";

import { wobbleCircle } from "../../../src/molecules/wobble-box/wobble-circle";
import { wobblePill } from "../../../src/molecules/wobble-box/wobble-pill";

const wobble = { amplitude: 1.5, wavelength: 16 };

const points = (d: string) =>
  [...d.matchAll(/(-?[\d.]+) (-?[\d.]+)/g)].map(([, x, y]) => ({
    x: Number(x),
    y: Number(y),
  }));

const distanceToSpine = (
  p: { x: number; y: number },
  from: number,
  to: number,
  y: number,
) => Math.hypot(p.x - Math.max(from, Math.min(to, p.x)), p.y - y);

describe("wobblePill", () => {
  it("draws a closed wobbly pill inside the box", () => {
    const { path, lines } = wobblePill({ width: 160, height: 48, wobble });
    expect(path.startsWith("M160 24")).toBe(true);
    expect(path.endsWith("Z")).toBe(true);
    expect(lines).toBe(path);
    const offsets = points(path).map((p) => distanceToSpine(p, 24, 136, 24));
    expect(offsets.length).toBeGreaterThan(50);
    for (const d of offsets) {
      expect(d).toBeGreaterThanOrEqual(24 - 2 * wobble.amplitude - 0.01);
      expect(d).toBeLessThanOrEqual(24 + 0.01);
    }
    expect(Math.max(...offsets) - Math.min(...offsets)).toBeGreaterThan(2);
  });

  it("is mirror symmetric across both axes", () => {
    const ring = points(wobblePill({ width: 160, height: 48, wobble }).path);
    const near = (x: number, y: number) =>
      ring.some((q) => Math.abs(q.x - x) < 0.05 && Math.abs(q.y - y) < 0.05);
    for (const p of ring) {
      expect(near(160 - p.x, p.y)).toBe(true);
      expect(near(p.x, 48 - p.y)).toBe(true);
    }
  });

  it("matches the wobble circle when the box is square", () => {
    const box = { width: 64, height: 64, wobble };
    expect(wobblePill(box)).toEqual(wobbleCircle(box));
  });

  it("draws a plain pill when the wobble is flat", () => {
    const { path } = wobblePill({
      width: 120,
      height: 40,
      wobble: { amplitude: 0, wavelength: 20 },
    });
    for (const p of points(path)) {
      expect(distanceToSpine(p, 20, 100, 20)).toBeCloseTo(20, 1);
    }
  });

  it("draws nothing when the box is empty", () => {
    expect(wobblePill({ width: 40, height: 2, wobble })).toEqual({
      path: "",
      lines: "",
    });
  });
});
