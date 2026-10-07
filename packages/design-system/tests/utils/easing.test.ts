import { describe, expect, it } from "vitest";

import {
  cubicBezier,
  parseCubicBezier,
  parseDuration,
} from "../../src/utils/easing";

describe("cubicBezier", () => {
  it("pins the endpoints", () => {
    const ease = cubicBezier(0.2, 0, 0, 1);
    expect(ease(-1)).toBe(0);
    expect(ease(0)).toBe(0);
    expect(ease(1)).toBe(1);
    expect(ease(2)).toBe(1);
  });

  it("matches linear when the control points sit on the diagonal", () => {
    const ease = cubicBezier(0.25, 0.25, 0.75, 0.75);
    for (const t of [0.1, 0.3, 0.5, 0.7, 0.9]) {
      expect(ease(t)).toBeCloseTo(t, 6);
    }
  });

  it("is symmetric for a symmetric curve", () => {
    const ease = cubicBezier(0.42, 0, 0.58, 1);
    expect(ease(0.5)).toBeCloseTo(0.5, 6);
    expect(ease(0.2)).toBeCloseTo(1 - ease(0.8), 6);
  });

  it("increases monotonically", () => {
    const ease = cubicBezier(0.2, 0, 0, 1);
    const values = Array.from({ length: 21 }, (_, i) => ease(i / 20));
    values.slice(1).forEach((v, i) => expect(v).toBeGreaterThan(values[i]));
  });

  it("decelerates for the standard curve", () => {
    const ease = cubicBezier(0.2, 0, 0, 1);
    expect(ease(0.5)).toBeGreaterThan(0.75);
  });
});

describe("parseCubicBezier", () => {
  it("parses a computed custom property", () => {
    const ease = parseCubicBezier(" cubic-bezier(0.2, 0, 0, 1)");
    expect(ease).not.toBeNull();
    expect(ease?.(0.5)).toBeCloseTo(cubicBezier(0.2, 0, 0, 1)(0.5), 6);
  });

  it.each(["", "ease", "cubic-bezier(0.2, 0, 0)", "cubic-bezier(2, 0, 0, 1)"])(
    "rejects %j",
    (value) => {
      expect(parseCubicBezier(value)).toBeNull();
    },
  );
});

describe("parseDuration", () => {
  it.each([
    ["320ms", 320],
    [" 0.2s ", 200],
    ["0ms", 0],
    [".5s", 500],
  ])("parses %j", (value, expected) => {
    expect(parseDuration(value)).toBe(expected);
  });

  it.each(["", "fast", "-1ms", "1"])("rejects %j", (value) => {
    expect(parseDuration(value)).toBeNull();
  });
});
