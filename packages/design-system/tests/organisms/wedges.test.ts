import { describe, expect, it } from "vitest";

import {
  wedgeGeometry,
  type WedgeGeometryOptions,
  type WedgeOrientation,
  type WedgePoint,
} from "../../src/organisms/wedges";

type Command =
  | { type: "M" | "L"; to: WedgePoint }
  | { type: "A"; radius: number; sweep: number; to: WedgePoint }
  | { type: "Z" };

const EPSILON = 0.02;

function parse(path: string): Command[] {
  return Array.from(path.matchAll(/([MLAZ])([^MLAZ]*)/g), ([, type, args]) => {
    const n = args.trim().split(/\s+/).filter(Boolean).map(Number);
    if (type === "Z") return { type };
    if (type === "A") {
      return { type, radius: n[0], sweep: n[4], to: { x: n[5], y: n[6] } };
    }
    return { type: type as "M" | "L", to: { x: n[0], y: n[1] } };
  });
}

const points = (path: string) =>
  parse(path).flatMap((c) => (c.type === "Z" ? [] : [c.to]));

const arcs = (path: string) =>
  parse(path).flatMap((c) => (c.type === "A" ? [c] : []));

const distance = (a: WedgePoint, b: WedgePoint) =>
  Math.hypot(a.x - b.x, a.y - b.y);

const base: Record<
  WedgeOrientation,
  Omit<WedgeGeometryOptions, "wedgesPerSide" | "expansion">
> = {
  row: {
    width: 1400,
    height: 860,
    orientation: "row",
    avatarRadius: 96,
    centerGap: 16,
    relatedGap: 8,
    cornerRadius: 16,
    ringThickness: 48,
    spread: 0.8,
  },
  column: {
    width: 374,
    height: 828,
    orientation: "column",
    avatarRadius: 80,
    centerGap: 16,
    relatedGap: 8,
    cornerRadius: 12,
    ringThickness: 32,
    spread: 0.8,
  },
};

const counts = [2, 3, 4, 5, 6];
const orientations: WedgeOrientation[] = ["row", "column"];
const rings = [true, false];
const progress = [0, 0.5, 1];

type Case = {
  options: WedgeGeometryOptions;
  expanded: number | null;
  label: string;
};

const cases: Case[] = orientations.flatMap((orientation) =>
  rings.flatMap((ring) =>
    counts.flatMap((wedgesPerSide) =>
      progress.flatMap((e) =>
        Array.from({ length: e === 0 ? 1 : wedgesPerSide }, (_, i) => {
          const values = Array.from({ length: wedgesPerSide }, (_, j) =>
            e > 0 && j === i ? e : 0,
          );
          return {
            options: {
              ...base[orientation],
              ringThickness: ring ? base[orientation].ringThickness : 0,
              wedgesPerSide,
              expansion: [values, values] as const,
            },
            expanded: e > 0 ? i : null,
            label: `${orientation} ring=${ring} n=${wedgesPerSide} e=${e}${e > 0 ? ` wedge=${i}` : ""}`,
          };
        }),
      ),
    ),
  ),
);

const cutRadiusOf = (o: WedgeGeometryOptions) =>
  o.avatarRadius +
  o.centerGap +
  (o.ringThickness > 0 ? o.ringThickness + o.relatedGap : 0);

describe("wedgeGeometry", () => {
  it.each(cases)("$label", ({ options, expanded }) => {
    const geometry = wedgeGeometry(options);
    const { width, height, centerGap, cornerRadius, wedgesPerSide } = options;
    const center = { x: width / 2, y: height / 2 };
    const cutRadius = cutRadiusOf(options);
    const row = options.orientation === "row";

    expect(geometry.center).toEqual(center);
    expect(geometry.cutRadius).toBeCloseTo(cutRadius);
    expect(geometry.sides).toHaveLength(2);

    geometry.sides.forEach((side, s) => {
      expect(side.wedges).toHaveLength(wedgesPerSide);

      side.wedges.forEach(({ path, anchor }) => {
        expect(path).toMatch(/^M/);
        expect(path).toMatch(/Z$/);
        expect(path).not.toMatch(/NaN|Infinity/);

        for (const p of [...points(path), anchor]) {
          expect(distance(p, center)).toBeGreaterThanOrEqual(
            cutRadius - EPSILON,
          );
          expect(p.x).toBeGreaterThanOrEqual(-EPSILON);
          expect(p.x).toBeLessThanOrEqual(width + EPSILON);
          expect(p.y).toBeGreaterThanOrEqual(-EPSILON);
          expect(p.y).toBeLessThanOrEqual(height + EPSILON);
          const across = row ? p.x - center.x : p.y - center.y;
          if (s === 0) {
            expect(across).toBeLessThanOrEqual(-centerGap / 2 + EPSILON);
          } else {
            expect(across).toBeGreaterThanOrEqual(centerGap / 2 - EPSILON);
          }
        }

        const radii = arcs(path).map((a) => a.radius);
        expect(radii.some((r) => Math.abs(r - cutRadius) < EPSILON)).toBe(
          true,
        );
        for (const r of radii) {
          const ring = Math.abs(r - cutRadius) < EPSILON;
          expect(ring || r <= cornerRadius + EPSILON).toBe(true);
        }
        expect(
          radii.filter((r) => Math.abs(r - cornerRadius) < EPSILON).length,
        ).toBeGreaterThanOrEqual(2);
      });

      if (options.ringThickness === 0) {
        expect(side.ring).toBeNull();
      } else {
        expect(side.ring).not.toBeNull();
      }
    });

    if (expanded !== null && options.expansion?.[0][expanded] === 1) {
      geometry.sides.forEach((side, s) => {
        const pts = points(side.wedges[expanded].path);
        const along = pts.map((p) => (row ? p.y : p.x));
        const across = pts.map((p) => (row ? p.x : p.y));
        const extent = row ? height : width;
        const half = (row ? width : height) / 2;
        expect(Math.min(...along)).toBeCloseTo(0, 1);
        expect(Math.max(...along)).toBeCloseTo(extent, 1);
        if (s === 0) {
          expect(Math.min(...across)).toBeCloseTo(0, 1);
          expect(Math.max(...across)).toBeCloseTo(half - centerGap / 2, 1);
        } else {
          expect(Math.min(...across)).toBeCloseTo(half + centerGap / 2, 1);
          expect(Math.max(...across)).toBeCloseTo(2 * half, 1);
        }
      });
    }

    const mirror = (p: WedgePoint) =>
      row ? { x: width - p.x, y: p.y } : { x: p.x, y: height - p.y };
    geometry.sides[0].wedges.forEach((wedge, i) => {
      const a = parse(wedge.path);
      const b = parse(geometry.sides[1].wedges[i].path);
      expect(b).toHaveLength(a.length);
      a.forEach((c, j) => {
        const d = b[j];
        expect(d.type).toBe(c.type);
        if (c.type === "Z" || d.type === "Z") return;
        const m = mirror(c.to);
        expect(d.to.x).toBeCloseTo(m.x, 1);
        expect(d.to.y).toBeCloseTo(m.y, 1);
        if (c.type === "A" && d.type === "A") {
          expect(d.radius).toBeCloseTo(c.radius, 1);
          expect(d.sweep).toBe(1 - c.sweep);
        }
      });
      const anchor = mirror(wedge.anchor);
      expect(geometry.sides[1].wedges[i].anchor.x).toBeCloseTo(anchor.x, 1);
      expect(geometry.sides[1].wedges[i].anchor.y).toBeCloseTo(anchor.y, 1);
    });
  });

  it.each(orientations)("builds %s label rings around the avatar", (o) => {
    const options = { ...base[o], wedgesPerSide: 3 };
    const geometry = wedgeGeometry(options);
    const { width, height, avatarRadius, centerGap, ringThickness } = options;
    const center = { x: width / 2, y: height / 2 };
    const inner = avatarRadius + centerGap;
    const outer = inner + ringThickness;
    const fillet = Math.min(options.cornerRadius, ringThickness / 2);
    const row = o === "row";

    geometry.sides.forEach((side, s) => {
      const ring = side.ring;
      expect(ring).not.toBeNull();
      if (!ring) return;
      expect(ring.path).toMatch(/^M.*Z$/);
      expect(ring.path).not.toMatch(/NaN|Infinity/);
      for (const p of points(ring.path)) {
        const r = distance(p, center);
        expect(r).toBeGreaterThanOrEqual(inner - EPSILON);
        expect(r).toBeLessThanOrEqual(outer + EPSILON);
        const across = row ? p.x - center.x : p.y - center.y;
        expect(s === 0 ? -across : across).toBeGreaterThanOrEqual(
          centerGap / 2 - EPSILON,
        );
      }
      const radii = arcs(ring.path).map((a) => a.radius);
      expect(radii).toHaveLength(6);
      for (const r of radii) {
        expect(
          [inner, outer, fillet].some((v) => Math.abs(v - r) < EPSILON),
        ).toBe(true);
      }

      const text = parse(ring.textPath);
      expect(text.map((c) => c.type)).toEqual(["M", "A"]);
      const [start, arc] = text;
      if (start.type !== "M" || arc.type !== "A") return;
      const mid = (inner + outer) / 2;
      expect(arc.radius).toBeCloseTo(mid, 1);
      expect(distance(start.to, center)).toBeCloseTo(mid, 1);
      expect(distance(arc.to, center)).toBeCloseTo(mid, 1);
      if (row) {
        if (s === 0) {
          expect(start.to.x).toBeLessThan(center.x);
          expect(start.to.y).toBeGreaterThan(arc.to.y);
        } else {
          expect(start.to.x).toBeGreaterThan(center.x);
          expect(start.to.y).toBeLessThan(arc.to.y);
        }
      } else {
        expect(start.to.x).toBeLessThan(arc.to.x);
        if (s === 0) expect(start.to.y).toBeLessThan(center.y);
        else expect(start.to.y).toBeGreaterThan(center.y);
      }
    });
  });

  it("splits two wedges along the horizontal spoke", () => {
    const options = { ...base.row, wedgesPerSide: 2 };
    const geometry = wedgeGeometry(options);
    const key = (p: WedgePoint) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
    geometry.sides.forEach((side) => {
      const [top, bottom] = side.wedges;
      const flipped = new Set(
        points(top.path).map((p) => key({ x: p.x, y: options.height - p.y })),
      );
      expect(new Set(points(bottom.path).map(key))).toEqual(flipped);
      expect(top.anchor.y).toBeLessThan(geometry.center.y);
      expect(bottom.anchor.y).toBeGreaterThan(geometry.center.y);
    });
  });

  it("orders wedges from the start of the outer edge", () => {
    for (const o of orientations) {
      const geometry = wedgeGeometry({ ...base[o], wedgesPerSide: 4 });
      for (const side of geometry.sides) {
        const along = side.wedges.map(({ anchor }) =>
          o === "row" ? anchor.y : anchor.x,
        );
        expect(along).toEqual([...along].sort((a, b) => a - b));
      }
    }
  });

  it("rejects a non-positive wedge count", () => {
    expect(() => wedgeGeometry({ ...base.row, wedgesPerSide: 0 })).toThrow(
      RangeError,
    );
  });
});
