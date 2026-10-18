export type WedgePoint = { x: number; y: number };

export type WedgeOrientation = "row" | "column";

export type WedgeWobble = { amplitude: number; wavelength: number };

export type WedgeGeometryOptions = {
  width: number;
  height: number;
  orientation: WedgeOrientation;
  avatarRadius: number;
  centerGap: number;
  relatedGap: number;
  cornerRadius: number;
  wedgesPerSide: number;
  spread: number;
  slotInset: number;
  wobble?: WedgeWobble;
  expansion?: readonly [readonly number[], readonly number[]];
};

export type WedgeRect = { x: number; y: number; width: number; height: number };

type WedgeOutline = { path: string; lines: string };

type WedgeCenter = WedgeOutline & { bounds: WedgeRect };

type WedgeShape = WedgeOutline & {
  tilt: number;
  bounds: WedgeRect;
  slot: WedgeRect | null;
};

type WedgeSide = {
  wedges: WedgeShape[];
  expandedSlot: WedgeRect | null;
};

export type WedgeGeometry = {
  cutRadius: number;
  center: WedgeCenter | null;
  sides: [WedgeSide, WedgeSide];
};

type Plane = { n: WedgePoint; c: number };

type Segment =
  | { type: "M" | "L"; to: WedgePoint }
  | { type: "A"; to: WedgePoint; radius: number; center: WedgePoint };

type Transform = (p: WedgePoint) => WedgePoint;

const point = (x: number, y: number): WedgePoint => ({ x, y });
const add = (a: WedgePoint, b: WedgePoint) => point(a.x + b.x, a.y + b.y);
const sub = (a: WedgePoint, b: WedgePoint) => point(a.x - b.x, a.y - b.y);
const mul = (a: WedgePoint, k: number) => point(a.x * k, a.y * k);
const dot = (a: WedgePoint, b: WedgePoint) => a.x * b.x + a.y * b.y;
const cross = (a: WedgePoint, b: WedgePoint) => a.x * b.y - a.y * b.x;
const len = (a: WedgePoint) => Math.hypot(a.x, a.y);
const norm = (a: WedgePoint) => mul(a, 1 / len(a));
const origin = point(0, 0);
const chebyshev = (a: WedgePoint) => Math.max(Math.abs(a.x), Math.abs(a.y));

const upright = (degrees: number) =>
  ((((degrees + 90) % 180) + 180) % 180) - 90;

const centroid = (pts: WedgePoint[]) =>
  mul(pts.reduce(add, origin), 1 / pts.length);

function clip(poly: WedgePoint[], { n, c }: Plane): WedgePoint[] {
  const out: WedgePoint[] = [];
  poly.forEach((a, i) => {
    const b = poly[(i + 1) % poly.length];
    const da = dot(n, a) - c;
    const db = dot(n, b) - c;
    if (da <= 0) out.push(a);
    if ((da < 0 && db > 0) || (da > 0 && db < 0)) {
      out.push(add(a, mul(sub(b, a), da / (da - db))));
    }
  });
  return out;
}

function corner(
  v: WedgePoint,
  prev: WedgePoint,
  next: WedgePoint,
  r: number,
): Segment[] {
  const d1 = norm(sub(prev, v));
  const d2 = norm(sub(next, v));
  const alpha = Math.acos(Math.max(-1, Math.min(1, dot(d1, d2))));
  if (r <= 0 || alpha > Math.PI - 1e-3) return [{ type: "L", to: v }];
  let t = r / Math.tan(alpha / 2);
  let radius = r;
  const tmax = Math.min(len(sub(prev, v)), len(sub(next, v))) / 2;
  if (t > tmax) {
    t = tmax;
    radius = t * Math.tan(alpha / 2);
  }
  const center = add(
    v,
    mul(norm(add(d1, d2)), radius / Math.sin(alpha / 2)),
  );
  return [
    { type: "L", to: add(v, mul(d1, t)) },
    { type: "A", to: add(v, mul(d2, t)), radius, center },
  ];
}

function roundedPoly(poly: WedgePoint[], r: number): Segment[] {
  const [first, ...rest] = poly.flatMap((v, i) =>
    corner(
      v,
      poly[(i - 1 + poly.length) % poly.length],
      poly[(i + 1) % poly.length],
      r,
    ),
  );
  return [{ type: "M", to: first.to }, ...rest];
}

function contains(poly: WedgePoint[], p: WedgePoint) {
  return poly.reduce((hit, a, i) => {
    const b = poly[(i + 1) % poly.length];
    if (a.y > p.y === b.y > p.y) return hit;
    const x = a.x + ((p.y - a.y) / (b.y - a.y)) * (b.x - a.x);
    return p.x < x ? !hit : hit;
  }, false);
}

function splitAtSquare(poly: WedgePoint[], R: number): WedgePoint[] {
  return poly.flatMap((a, i) => {
    const b = poly[(i + 1) % poly.length];
    const d = sub(b, a);
    let t0 = 0;
    let t1 = 1;
    for (const [p, q] of [
      [-d.x, a.x + R],
      [d.x, R - a.x],
      [-d.y, a.y + R],
      [d.y, R - a.y],
    ]) {
      if (p === 0) {
        if (q < 0) return [a];
        continue;
      }
      if (p < 0) t0 = Math.max(t0, q / p);
      else t1 = Math.min(t1, q / p);
    }
    if (t0 >= t1) return [a];
    return [
      a,
      ...[t0, t1]
        .filter((t) => t > 1e-9 && t < 1 - 1e-9)
        .map((t) => add(a, mul(d, t))),
    ];
  });
}

function marksBetween(a: WedgePoint, b: WedgePoint, marks: WedgePoint[]) {
  const d = sub(b, a);
  const length = len(d);
  return marks
    .map((m) => ({ m, t: dot(sub(m, a), d) / (length * length) }))
    .filter(
      ({ m, t }) =>
        t > 1e-6 &&
        t < 1 - 1e-6 &&
        Math.abs(cross(sub(m, a), d)) / length < 1e-6,
    )
    .sort((p, q) => p.t - q.t)
    .map(({ m }) => m);
}

function squareCutPath(
  source: WedgePoint[],
  R: number,
  r: number,
  marks: WedgePoint[] = [],
): Segment[] {
  const poly = splitAtSquare(source, R);
  const n = poly.length;
  const inside = poly.map(
    (a, i) => chebyshev(mul(add(a, poly[(i + 1) % n]), 0.5)) < R - 1e-9,
  );
  if (inside.every(Boolean)) return [];
  if (!inside.some(Boolean)) return roundedPoly(poly, r);
  const k = inside.findIndex((v, i) => v && !inside[(i - 1 + n) % n]);
  let m = k;
  while (inside[(m + 1) % n]) m = (m + 1) % n;
  const entry = poly[k];
  const exit = poly[(m + 1) % n];
  const outside: WedgePoint[] = [];
  for (let i = (m + 1) % n; i !== k; i = (i + 1) % n) outside.push(poly[i]);
  const corners = [
    point(-R, -R),
    point(-R, R),
    point(R, -R),
    point(R, R),
  ]
    .filter(
      (c) =>
        contains(source, c) &&
        len(sub(c, entry)) > 1e-6 &&
        len(sub(c, exit)) > 1e-6,
    )
    .sort((a, b) => len(sub(a, entry)) - len(sub(b, entry)));
  const walk = [entry, ...corners, exit];
  const boundary = walk
    .slice(0, -1)
    .flatMap((a, i) => [a, ...marksBetween(a, walk[i + 1], marks)]);
  return roundedPoly([...outside, ...boundary], r);
}

const wobbleStep = 2;
const wobbleBlend = 0.2;

const smoothstep = (x: number) => {
  const t = Math.max(0, Math.min(1, x));
  return t * t * (3 - 2 * t);
};

function wave(cycles: number, t: number) {
  const k = Math.floor(cycles);
  const a = smoothstep((cycles - k - 0.5) / wobbleBlend + 0.5);
  return (
    (1 - a) * Math.sin(2 * Math.PI * k * t) +
    a * Math.sin(2 * Math.PI * (k + 1) * t)
  );
}

export function wobbleLine(
  a: WedgePoint,
  b: WedgePoint,
  { amplitude, wavelength }: WedgeWobble,
): WedgePoint[] {
  const d = sub(b, a);
  const length = len(d);
  if (!(amplitude > 0 && wavelength > 0 && length > 0)) return [];
  const normal = point(-d.y / length, d.x / length);
  const cycles = length / wavelength;
  const taper = wavelength / 6;
  const n = Math.ceil(length / wobbleStep);
  return Array.from({ length: Math.max(0, n - 1) }, (_, i) => {
    const t = (i + 1) / n;
    const ease = smoothstep((Math.min(t, 1 - t) * length) / taper);
    const offset = amplitude * ease * wave(cycles, t);
    return add(add(a, mul(d, t)), mul(normal, offset));
  });
}

type Bend = (a: WedgePoint, b: WedgePoint) => WedgePoint[] | null;

function outline(
  segments: Segment[],
  transform: Transform,
  bend: Bend,
): WedgeOutline {
  if (segments.length === 0) return { path: "", lines: "" };
  const start = transform(segments[0].to);
  let path = `M${fmtPoint(start)}`;
  let lines = "";
  let current = start;
  let drawing = false;
  const draw = (d: string, to: WedgePoint) => {
    if (!drawing) lines += `M${fmtPoint(current)}`;
    lines += d;
    drawing = true;
    current = to;
  };
  const line = (p: WedgePoint) => {
    const bent = bend(current, p);
    const d = [...(bent ?? []), p].map((q) => `L${fmtPoint(q)}`).join("");
    path += d;
    if (bent) {
      draw(d, p);
    } else {
      drawing = false;
      current = p;
    }
  };
  for (const segment of segments.slice(1)) {
    const p = transform(segment.to);
    if (segment.type === "A" && segment.radius > 0) {
      const c = transform(segment.center);
      const sweep = cross(sub(current, c), sub(p, c)) > 0 ? 1 : 0;
      const d = `A${fmt(segment.radius)} ${fmt(segment.radius)} 0 0 ${sweep} ${fmtPoint(p)}`;
      path += d;
      draw(d, p);
    } else {
      line(p);
    }
  }
  if (len(sub(current, start)) > 1e-9) line(start);
  return { path: `${path}Z`, lines };
}

type Slot = { min: WedgePoint; max: WedgePoint };

function segmentDistance(p: WedgePoint, a: WedgePoint, b: WedgePoint) {
  const d = sub(b, a);
  const t = Math.max(0, Math.min(1, dot(sub(p, a), d) / dot(d, d)));
  return len(sub(p, add(a, mul(d, t))));
}

function clearance(poly: WedgePoint[], R: number, p: WedgePoint) {
  if (!contains(poly, p)) return 0;
  const square = len(
    point(Math.max(0, Math.abs(p.x) - R), Math.max(0, Math.abs(p.y) - R)),
  );
  return poly.reduce(
    (nearest, a, i) =>
      Math.min(nearest, segmentDistance(p, a, poly[(i + 1) % poly.length])),
    square,
  );
}

function roomiest(poly: WedgePoint[], R: number): WedgePoint | null {
  const { x, y, width, height } = boundsOf(poly);
  const steps = 24;
  let best: { at: WedgePoint; room: number } | null = null;
  let reach = point(width, height);
  let from = point(x, y);
  for (let pass = 0; pass < 4; pass++) {
    for (let i = 0; i <= steps; i++) {
      for (let j = 0; j <= steps; j++) {
        const at = add(from, point((reach.x * i) / steps, (reach.y * j) / steps));
        const room = clearance(poly, R, at);
        if (room > 0 && (!best || room > best.room)) best = { at, room };
      }
    }
    if (!best) return null;
    reach = mul(reach, 2 / steps);
    from = sub(best.at, mul(reach, 0.5));
  }
  return best?.at ?? null;
}

function fits(poly: WedgePoint[], R: number, min: WedgePoint, max: WedgePoint) {
  const clear = min.x >= R || max.x <= -R || min.y >= R || max.y <= -R;
  return (
    clear &&
    [min, point(min.x, max.y), max, point(max.x, min.y)].every((c) =>
      contains(poly, c),
    )
  );
}

function centeredSlot(poly: WedgePoint[], R: number): Slot | null {
  if (poly.length < 3) return null;
  const at = roomiest(poly, R);
  if (!at) return null;
  const { width, height } = boundsOf(poly);
  const tallest = (w: number) => {
    let lo = 0;
    let hi = height;
    for (let k = 0; k < 24; k++) {
      const h = (lo + hi) / 2;
      const half = point(w, h);
      if (fits(poly, R, sub(at, half), add(at, half))) lo = h;
      else hi = h;
    }
    return lo;
  };
  const steps = 48;
  let best: (Slot & { area: number }) | null = null;
  for (let i = 1; i < steps; i++) {
    const w = (width / 2) * (i / steps);
    const half = point(w, tallest(w));
    const area = half.x * half.y;
    if (area > 0 && (!best || area > best.area)) {
      best = { min: sub(at, half), max: add(at, half), area };
    }
  }
  return best;
}

function boundsOf(pts: WedgePoint[]): WedgeRect {
  const xs = pts.map((p) => p.x);
  const ys = pts.map((p) => p.y);
  const x = Math.min(...xs);
  const y = Math.min(...ys);
  return { x, y, width: Math.max(...xs) - x, height: Math.max(...ys) - y };
}

function slotRect(slot: Slot | null, transform: Transform): WedgeRect | null {
  if (!slot) return null;
  const a = transform(slot.min);
  const b = transform(slot.max);
  const x = Math.min(a.x, b.x);
  const y = Math.min(a.y, b.y);
  return { x, y, width: Math.abs(a.x - b.x), height: Math.abs(a.y - b.y) };
}

const fmt = (n: number) => String(Math.round(n * 100) / 100);
const fmtPoint = (p: WedgePoint) => `${fmt(p.x)} ${fmt(p.y)}`;

function sideFrames(
  orientation: WedgeOrientation,
  cx: number,
  cy: number,
): [Transform, Transform] {
  if (orientation === "row") {
    return [
      (p) => point(cx + p.x, cy + p.y),
      (p) => point(cx - p.x, cy + p.y),
    ];
  }
  return [
    (p) => point(cx + p.y, cy + p.x),
    (p) => point(cx + p.y, cy - p.x),
  ];
}

export function wedgeGeometry({
  width,
  height,
  orientation,
  avatarRadius,
  centerGap,
  relatedGap,
  cornerRadius,
  wedgesPerSide,
  spread,
  slotInset,
  wobble,
  expansion,
}: WedgeGeometryOptions): WedgeGeometry {
  if (!Number.isInteger(wedgesPerSide) || wedgesPerSide < 1) {
    throw new RangeError("wedgesPerSide must be a positive integer");
  }
  if (!(spread > 0 && spread <= 1)) {
    throw new RangeError("spread must be in (0, 1]");
  }
  if (!(slotInset >= 0)) {
    throw new RangeError("slotInset must be non-negative");
  }
  const row = orientation === "row";
  const E = (row ? width : height) / 2;
  const S = (row ? height : width) / 2;
  const center = point(width / 2, height / 2);
  const cutRadius = avatarRadius + centerGap;
  const fits = cutRadius + cornerRadius < Math.min(E, S);

  const hits =
    wedgesPerSide === 2
      ? [0]
      : Array.from(
          { length: wedgesPerSide - 1 },
          (_, k) =>
            -spread * S + (k * 2 * spread * S) / (wedgesPerSide - 2),
        );
  const phis = [0, ...hits.map((y) => Math.atan2(E, -y)), Math.PI];
  const box = (d: number) => [
    point(-E + d, -S + d),
    point(-centerGap / 2 - d, -S + d),
    point(-centerGap / 2 - d, S - d),
    point(-E + d, S - d),
  ];
  const halfPlane = (phi: number, sign: number, d: number): Plane => ({
    n: point(sign * Math.cos(phi), -sign * Math.sin(phi)),
    c: -relatedGap / 2 - d,
  });
  const wedge = (a: number, b: number, d = 0) =>
    -E + d < -centerGap / 2 - d && -S + d < S - d
      ? [halfPlane(a, 1, d), halfPlane(b, -1, d)].reduce(clip, box(d))
      : [];

  const count = fits ? wedgesPerSide : 0;
  const near = (a: number, b: number) => Math.abs(a - b) < 1e-6;
  const edge = (a: number, b: number, at: number) => near(a, at) && near(b, at);
  const bend: Bend = (a, b) =>
    edge(a.x, b.x, 0) ||
    edge(a.x, b.x, width) ||
    edge(a.y, b.y, 0) ||
    edge(a.y, b.y, height)
      ? null
      : wobble
        ? wobbleLine(a, b, wobble).map((p) =>
            point(
              Math.max(0, Math.min(width, p.x)),
              Math.max(0, Math.min(height, p.y)),
            ),
          )
        : [];
  const marks = phis
    .slice(0, count)
    .flatMap((phi, i) => squareCutPath(wedge(phi, phis[i + 1]), cutRadius, 0))
    .map((segment) => segment.to)
    .filter((p) => near(chebyshev(p), cutRadius));

  const frames = sideFrames(orientation, center.x, center.y);
  const centerOutline = (): WedgeCenter | null => {
    if (count === 0) return null;
    const around = (p: WedgePoint) => Math.atan2(p.y - center.y, p.x - center.x);
    const ring = frames
      .flatMap((transform) => marks.map(transform))
      .sort((a, b) => around(a) - around(b))
      .filter(
        (p, i, all) =>
          i === 0 || len(sub(p, all[i - 1])) > 1e-3,
      );
    if (ring.length > 1 && len(sub(ring[0], ring[ring.length - 1])) <= 1e-3) {
      ring.pop();
    }
    if (ring.length < 3) return null;
    const corner = sub(center, point(cutRadius, cutRadius));
    const local: Transform = (p) => sub(p, corner);
    return {
      ...outline(
        ring.map((to, i) => ({ type: i === 0 ? "M" : "L", to })),
        local,
        (a, b) => bend(add(a, corner), add(b, corner))?.map(local) ?? null,
      ),
      bounds: {
        x: corner.x,
        y: corner.y,
        width: cutRadius * 2,
        height: cutRadius * 2,
      },
    };
  };
  const sides = frames.map((transform, s) => {
    const wedges = phis.slice(0, count).flatMap((phi, i) => {
      const raw = expansion?.[s]?.[i] ?? 0;
      const e = Math.max(0, Math.min(1, raw));
      const next = phis[i + 1];
      const from = phi * (1 - e);
      const to = next + (Math.PI - next) * e;
      const poly = wedge(from, to);
      if (poly.length < 3) return [];
      const beyond = (p: WedgePoint) => chebyshev(p) >= cutRadius;
      const cut = squareCutPath(poly, cutRadius, cornerRadius, marks);
      if (cut.length === 0) return [];
      const far = centroid(poly.filter(beyond));
      const anchor = transform(mul(norm(far), (cutRadius + len(far)) / 2));
      const bounds = boundsOf(
        [
          ...poly.filter(beyond),
          ...cut.map((segment) => segment.to),
        ].map(transform),
      );
      let slot: WedgeRect | null | undefined;
      const slotOf = () => {
        if (slot === undefined) {
          slot = slotRect(
            centeredSlot(wedge(from, to, slotInset), cutRadius + slotInset),
            transform,
          );
        }
        return slot;
      };
      let tilt: number | undefined;
      return [
        {
          ...outline(cut, transform, bend),
          bounds,
          get slot() {
            return slotOf();
          },
          get tilt() {
            if (tilt === undefined) {
              const at = slotOf();
              const axis = sub(
                at ? point(at.x + at.width / 2, at.y + at.height / 2) : anchor,
                center,
              );
              tilt = upright((Math.atan2(axis.y, axis.x) * 180) / Math.PI);
            }
            return tilt;
          },
        },
      ];
    });
    let expandedSlot: WedgeRect | null | undefined;
    return {
      wedges,
      get expandedSlot() {
        if (expandedSlot === undefined) {
          expandedSlot =
            count > 0
              ? slotRect(
                  centeredSlot(wedge(0, Math.PI, slotInset), cutRadius + slotInset),
                  transform,
                )
              : null;
        }
        return expandedSlot;
      },
    };
  });

  return {
    cutRadius,
    center: centerOutline(),
    sides: [sides[0], sides[1]],
  };
}
