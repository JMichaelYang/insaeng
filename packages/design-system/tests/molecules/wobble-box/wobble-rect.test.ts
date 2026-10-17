import { describe, expect, it } from "vitest";

import { wobbleRect } from "../../../src/molecules/wobble-box/wobble-rect";

const wobble = { amplitude: 3, wavelength: 30 };

const points = (d: string) =>
  [...d.matchAll(/(-?[\d.]+) (-?[\d.]+)/g)].map(([, x, y]) => ({
    x: Number(x),
    y: Number(y),
  }));

describe("wobbleRect", () => {
  it("draws a plain rectangle without lines when no edge wobbles", () => {
    const { path, lines } = wobbleRect({
      width: 100,
      height: 40,
      wobble,
      edges: {},
    });
    expect(path).toBe("M0 0L100 0L100 40L0 40L0 0Z");
    expect(lines).toBe("");
  });

  it("wobbles only the bottom edge within the box", () => {
    const { path, lines } = wobbleRect({
      width: 300,
      height: 64,
      wobble,
      edges: { bottom: true },
    });
    expect(path.startsWith("M0 0L300 0L300 61")).toBe(true);
    expect(lines.startsWith("M300 61")).toBe(true);
    expect(lines.endsWith("L0 61")).toBe(true);
    const bottom = points(lines);
    expect(bottom.length).toBeGreaterThan(10);
    expect(new Set(bottom.map((p) => p.y)).size).toBeGreaterThan(1);
    for (const p of points(path)) {
      expect(p.x).toBeGreaterThanOrEqual(0);
      expect(p.x).toBeLessThanOrEqual(300);
      expect(p.y).toBeGreaterThanOrEqual(0);
      expect(p.y).toBeLessThanOrEqual(64);
    }
  });

  it("closes the outline when every edge wobbles", () => {
    const { path, lines } = wobbleRect({
      width: 96,
      height: 96,
      wobble,
      edges: { top: true, right: true, bottom: true, left: true },
    });
    expect(lines.startsWith("M3 3")).toBe(true);
    expect(lines.match(/M/g)).toHaveLength(1);
    expect(lines.endsWith("Z")).toBe(true);
    for (const p of points(path)) {
      expect(p.x).toBeGreaterThanOrEqual(0);
      expect(p.x).toBeLessThanOrEqual(96);
      expect(p.y).toBeGreaterThanOrEqual(0);
      expect(p.y).toBeLessThanOrEqual(96);
    }
  });
});
