import { describe, expect, it } from "vitest";

import {
  wedgeGeometry,
  type WedgeGeometryOptions,
  type WedgeOrientation,
  type WedgePoint,
  type WedgeRect,
} from "../../src/utils/wedge-geometry";

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

const inside = (p: WedgePoint, poly: WedgePoint[]) =>
  poly.reduce((hit, a, i) => {
    const b = poly[(i + 1) % poly.length];
    if (a.y > p.y === b.y > p.y) return hit;
    const x = a.x + ((p.y - a.y) / (b.y - a.y)) * (b.x - a.x);
    return p.x < x ? !hit : hit;
  }, false);

function expectSlotInside(
  slot: WedgeRect | null,
  path: string,
  options: WedgeGeometryOptions,
) {
  expect(slot).not.toBeNull();
  if (!slot) return;
  const { width, height, slotInset } = options;
  const center = { x: width / 2, y: height / 2 };
  expect(slot.width).toBeGreaterThan(0);
  expect(slot.height).toBeGreaterThan(0);
  expect(slot.x).toBeGreaterThanOrEqual(slotInset - EPSILON);
  expect(slot.y).toBeGreaterThanOrEqual(slotInset - EPSILON);
  expect(slot.x + slot.width).toBeLessThanOrEqual(width - slotInset + EPSILON);
  expect(slot.y + slot.height).toBeLessThanOrEqual(
    height - slotInset + EPSILON,
  );
  const nearest = {
    x: Math.max(slot.x, Math.min(center.x, slot.x + slot.width)),
    y: Math.max(slot.y, Math.min(center.y, slot.y + slot.height)),
  };
  expect(distance(nearest, center)).toBeGreaterThanOrEqual(
    cutRadiusOf(options) + slotInset - EPSILON,
  );
  const outline = points(path);
  const steps = 8;
  for (let k = 0; k <= steps; k++) {
    const t = k / steps;
    for (const p of [
      { x: slot.x + t * slot.width, y: slot.y },
      { x: slot.x + t * slot.width, y: slot.y + slot.height },
      { x: slot.x, y: slot.y + t * slot.height },
      { x: slot.x + slot.width, y: slot.y + t * slot.height },
    ]) {
      expect(inside(p, outline)).toBe(true);
    }
  }
}

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
    slotInset: 16,
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
    slotInset: 16,
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
        (e === 1
          ? Array.from({ length: wedgesPerSide }, (_, i) => i)
          : [Math.floor(wedgesPerSide / 2)]
        ).map((i) => {
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

    expect(geometry.cutRadius).toBeCloseTo(cutRadius);
    expect(geometry.sides).toHaveLength(2);

    geometry.sides.forEach((side, s) => {
      expect(side.wedges).toHaveLength(wedgesPerSide);

      side.wedges.forEach(({ path, anchor, slot }) => {
        expectSlotInside(slot, path, options);
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
      const slot = wedge.slot;
      const twin = geometry.sides[1].wedges[i].slot;
      if (slot && twin) {
        const far = mirror({ x: slot.x + slot.width, y: slot.y + slot.height });
        const near = mirror({ x: slot.x, y: slot.y });
        expect(twin.x).toBeCloseTo(Math.min(far.x, near.x), 1);
        expect(twin.y).toBeCloseTo(Math.min(far.y, near.y), 1);
        expect(twin.width).toBeCloseTo(slot.width, 1);
        expect(twin.height).toBeCloseTo(slot.height, 1);
      }
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
      expect(top.anchor.y).toBeLessThan(options.height / 2);
      expect(bottom.anchor.y).toBeGreaterThan(options.height / 2);
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

  it.each(orientations)("grows %s slots as the inset shrinks", (o) => {
    const area = (slotInset: number) =>
      wedgeGeometry({ ...base[o], wedgesPerSide: 4, slotInset }).sides[0].wedges.map(
        ({ slot }) => (slot ? slot.width * slot.height : 0),
      );
    const loose = area(8);
    const snug = area(32);
    loose.forEach((a, i) => expect(a).toBeGreaterThan(snug[i]));
  });

  it("leaves no slot when the inset consumes the wedge", () => {
    const geometry = wedgeGeometry({
      ...base.column,
      wedgesPerSide: 4,
      slotInset: 400,
    });
    for (const side of geometry.sides) {
      expect(side.wedges).toHaveLength(4);
      for (const { slot } of side.wedges) expect(slot).toBeNull();
    }
  });

  it("returns the same slot on every read", () => {
    const [wedge] = wedgeGeometry({ ...base.row, wedgesPerSide: 4 }).sides[0]
      .wedges;
    expect(wedge.slot).not.toBeNull();
    expect(wedge.slot).toBe(wedge.slot);
  });

  it.each([-1, Number.NaN])("rejects slot inset %s", (slotInset) => {
    expect(() =>
      wedgeGeometry({ ...base.row, wedgesPerSide: 4, slotInset }),
    ).toThrow(RangeError);
  });

  it("rejects a non-positive wedge count", () => {
    expect(() => wedgeGeometry({ ...base.row, wedgesPerSide: 0 })).toThrow(
      RangeError,
    );
  });

  it.each([0, -0.1, 1.1, Number.NaN])("rejects spread %s", (spread) => {
    expect(() =>
      wedgeGeometry({ ...base.row, wedgesPerSide: 4, spread }),
    ).toThrow(RangeError);
  });

  it.each(orientations)("accepts a full %s spread", (o) => {
    const options = { ...base[o], wedgesPerSide: 4, spread: 1 };
    const geometry = wedgeGeometry(options);
    for (const side of geometry.sides) {
      expect(side.wedges).toHaveLength(4);
      for (const { path } of side.wedges) {
        expect(path).not.toMatch(/NaN|Infinity/);
        for (const p of points(path)) {
          expect(p.x).toBeGreaterThanOrEqual(-EPSILON);
          expect(p.x).toBeLessThanOrEqual(options.width + EPSILON);
          expect(p.y).toBeGreaterThanOrEqual(-EPSILON);
          expect(p.y).toBeLessThanOrEqual(options.height + EPSILON);
        }
      }
    }
  });

  const frames: [number, number][] = [
    [120, 120],
    [150, 150],
    [980, 200],
    [1000, 190],
    [1100, 300],
    [200, 980],
    [390, 400],
  ];
  const tight = orientations.flatMap((orientation) =>
    frames.flatMap(([width, height]) =>
      [0, 32].flatMap((ringThickness) =>
        [0, 1].map((e) => ({
          options: {
            ...base[orientation],
            width,
            height,
            ringThickness,
            wedgesPerSide: 4,
            expansion: [
              [e, 0, 0, 0],
              [0, 0, 0, e],
            ] as const,
          },
          label: `${orientation} ${width}x${height} ring=${ringThickness} e=${e}`,
        })),
      ),
    ),
  );

  it.each(tight)("stays inside a tight frame: $label", ({ options }) => {
    const geometry = wedgeGeometry(options);
    const center = { x: options.width / 2, y: options.height / 2 };
    for (const side of geometry.sides) {
      expect([0, options.wedgesPerSide]).toContain(side.wedges.length);
      for (const { path } of side.wedges) {
        expect(path).not.toMatch(/NaN|Infinity/);
        for (const p of points(path)) {
          expect(distance(p, center)).toBeGreaterThanOrEqual(
            geometry.cutRadius - EPSILON,
          );
          expect(p.x).toBeGreaterThanOrEqual(-EPSILON);
          expect(p.x).toBeLessThanOrEqual(options.width + EPSILON);
          expect(p.y).toBeGreaterThanOrEqual(-EPSILON);
          expect(p.y).toBeLessThanOrEqual(options.height + EPSILON);
        }
      }
    }
  });

  it("draws no wedges when the cut circle does not fit", () => {
    const geometry = wedgeGeometry({
      ...base.column,
      width: 120,
      height: 120,
      ringThickness: 0,
      wedgesPerSide: 4,
    });
    for (const side of geometry.sides) expect(side.wedges).toHaveLength(0);
  });

  it.each(orientations)("covers each %s half with one wedge", (o) => {
    const geometry = wedgeGeometry({ ...base[o], wedgesPerSide: 1 });
    const full = wedgeGeometry({
      ...base[o],
      wedgesPerSide: 2,
      expansion: [
        [1, 0],
        [1, 0],
      ],
    });
    geometry.sides.forEach((side, s) => {
      expect(side.wedges).toHaveLength(1);
      expect(side.wedges[0].path).toBe(full.sides[s].wedges[0].path);
    });
  });

  it.each(orientations)("draws sharp %s corners at radius 0", (o) => {
    const geometry = wedgeGeometry({
      ...base[o],
      wedgesPerSide: 4,
      cornerRadius: 0,
    });
    for (const side of geometry.sides) {
      for (const { path } of side.wedges) {
        expect(path).not.toMatch(/NaN|Infinity/);
        for (const { radius } of arcs(path)) {
          expect(radius).toBeCloseTo(geometry.cutRadius, 1);
        }
      }
    }
  });

  const bare = { ...base.column, ringThickness: 0 };
  const narrow: WedgeGeometryOptions[] = [
    { ...bare, wedgesPerSide: 4, relatedGap: 12, centerGap: 12 },
    { ...bare, wedgesPerSide: 6, relatedGap: 12, centerGap: 12 },
    { ...bare, wedgesPerSide: 6, cornerRadius: 24 },
    { ...base.row, wedgesPerSide: 6, cornerRadius: 24 },
    { ...bare, wedgesPerSide: 4, relatedGap: 4, centerGap: 8 },
    { ...bare, wedgesPerSide: 6, spread: 0.3 },
  ];

  it.each(narrow)(
    "cuts each ring arc the same way ($orientation, n=$wedgesPerSide)",
    (options) => {
      const geometry = wedgeGeometry(options);
      for (const side of geometry.sides) {
        const sweeps = side.wedges.flatMap(({ path }) => {
          const cut = arcs(path).filter(
            (a) => Math.abs(a.radius - geometry.cutRadius) < EPSILON,
          );
          expect(cut.length).toBeLessThanOrEqual(1);
          return cut.map((a) => a.sweep);
        });
        expect(sweeps.length).toBeGreaterThan(0);
        expect(new Set(sweeps).size).toBe(1);
      }
    },
  );
});
