import { describe, expect, it } from "vitest";

import { wobbleCircle } from "../../../src/molecules/wobble-box/wobble-circle";

const wobble = { amplitude: 3, wavelength: 30 };

const points = (d: string) =>
  [...d.matchAll(/(-?[\d.]+) (-?[\d.]+)/g)].map(([, x, y]) => ({
    x: Number(x),
    y: Number(y),
  }));

describe("wobbleCircle", () => {
  it("draws a closed wobbly circle inside the box", () => {
    const { path, lines } = wobbleCircle({ width: 80, height: 80, wobble });
    expect(path.startsWith("M80 40")).toBe(true);
    expect(path.endsWith("Z")).toBe(true);
    expect(lines).toBe(path);
    const radii = points(path).map((p) => Math.hypot(p.x - 40, p.y - 40));
    expect(radii.length).toBeGreaterThan(20);
    for (const r of radii) {
      expect(r).toBeGreaterThanOrEqual(37 - wobble.amplitude - 0.01);
      expect(r).toBeLessThanOrEqual(40 + 0.01);
    }
    expect(Math.max(...radii) - Math.min(...radii)).toBeGreaterThan(1);
  });

  it("closes the wave with an even number of whole cycles", () => {
    const { path } = wobbleCircle({ width: 80, height: 80, wobble });
    const ring = points(path);
    const radii = ring.map((p) => Math.hypot(p.x - 40, p.y - 40));
    const n = radii.length;
    const peaks = radii.filter(
      (r, i) => r > radii[(i - 1 + n) % n] && r >= radii[(i + 1) % n],
    ).length;
    expect(peaks).toBe(2 * Math.round((Math.PI * 37) / wobble.wavelength));
    for (const p of ring) {
      const twin = ring.some(
        (q) => Math.abs(q.x - (80 - p.x)) < 0.05 && Math.abs(q.y - p.y) < 0.05,
      );
      expect(twin).toBe(true);
    }
  });

  it("fits the shorter side of the box", () => {
    const { path } = wobbleCircle({ width: 200, height: 64, wobble });
    for (const p of points(path)) {
      expect(Math.hypot(p.x - 100, p.y - 32)).toBeLessThanOrEqual(32 + 0.01);
    }
  });

  it("draws a plain circle when the wobble is flat", () => {
    const { path } = wobbleCircle({
      width: 64,
      height: 64,
      wobble: { amplitude: 0, wavelength: 20 },
    });
    for (const p of points(path)) {
      expect(Math.hypot(p.x - 32, p.y - 32)).toBeCloseTo(32, 1);
    }
  });

  it("draws nothing when the box is empty", () => {
    expect(wobbleCircle({ width: 4, height: 4, wobble })).toEqual({
      path: "",
      lines: "",
    });
  });
});
