export type WedgePoint = { x: number; y: number };

export type WedgeOrientation = "row" | "column";

export type WedgeCenterShape = "circle" | "square";

export type WedgeWobble = { amplitude: number; wavelength: number };

export type WedgeGeometryOptions = {
  width: number;
  height: number;
  orientation: WedgeOrientation;
  centerShape?: WedgeCenterShape;
  avatarRadius: number;
  centerGap: number;
  relatedGap: number;
  cornerRadius: number;
  ringThickness: number;
  wedgesPerSide: number;
  spread: number;
  slotInset: number;
  wobble?: WedgeWobble;
  expansion?: readonly [readonly number[], readonly number[]];
};

export type WedgeRect = { x: number; y: number; width: number; height: number };

type WedgeOutline = { path: string; lines: string };

type WedgeShape = WedgeOutline & {
  anchor: WedgePoint;
  tilt: number;
  bounds: WedgeRect;
  slot: WedgeRect | null;
};

type WedgeRing = { path: string };

type WedgeSide = {
  wedges: WedgeShape[];
  ring: WedgeRing | null;
  expandedSlot: WedgeRect | null;
};

type WedgeGeometry = {
  cutRadius: number;
  center: WedgeOutline | null;
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

function fillet(
  p0: WedgePoint,
  u: WedgePoint,
  inward: WedgePoint,
  R: number,
  r: number,
) {
  const q = add(p0, mul(inward, r));
  const b = dot(q, u);
  const disc = b * b - (dot(q, q) - (R + r) ** 2);
  const s = -b - Math.sqrt(Math.max(0, disc));
  const center = add(q, mul(u, s));
  return {
    line: sub(center, mul(inward, r)),
    circle: mul(center, R / (R + r)),
    center,
  };
}

function splitAtRing(poly: WedgePoint[], R: number): WedgePoint[] {
  return poly.flatMap((a, i) => {
    const b = poly[(i + 1) % poly.length];
    const d = sub(b, a);
    const t = Math.max(0, Math.min(1, -dot(a, d) / dot(d, d)));
    const c = add(a, mul(d, t));
    return len(a) >= R && len(b) >= R && len(c) < R ? [a, c] : [a];
  });
}

function ringCutPath(source: WedgePoint[], R: number, r: number): Segment[] {
  const poly = splitAtRing(source, R);
  const n = poly.length;
  const inside = poly.map((p) => len(p) < R);
  if (!inside.some(Boolean)) return roundedPoly(poly, r);
  const k = inside.findIndex((v, i) => v && !inside[(i - 1 + n) % n]);
  let m = k;
  while (inside[(m + 1) % n]) m = (m + 1) % n;
  const a0 = poly[(k - 1 + n) % n];
  const u0 = norm(sub(poly[k], a0));
  const in0 = point(-u0.y, u0.x);
  const b1 = poly[(m + 1) % n];
  const u1 = norm(sub(poly[m], b1));
  const in1 = point(u1.y, -u1.x);
  const turn = (radius: number) =>
    cross(
      fillet(a0, u0, in0, R, radius).circle,
      fillet(b1, u1, in1, R, radius).circle,
    );
  const direction = Math.sign(turn(0));
  let rr = r;
  if (Math.sign(turn(r)) !== direction) {
    let lo = 0;
    for (let i = 0; i < 30; i++) {
      const mid = (lo + rr) / 2;
      if (Math.sign(turn(mid)) === direction) lo = mid;
      else rr = mid;
    }
    rr = lo;
  }
  const entry = fillet(a0, u0, in0, R, rr);
  const exit = fillet(b1, u1, in1, R, rr);
  const outside: WedgePoint[] = [];
  for (let i = (m + 1) % n; i !== k; i = (i + 1) % n) outside.push(poly[i]);
  const segments: Segment[] = [{ type: "M", to: exit.line }];
  outside.forEach((v, i) => {
    const prev = i === 0 ? exit.line : outside[i - 1];
    const next = i === outside.length - 1 ? entry.line : outside[i + 1];
    segments.push(...corner(v, prev, next, r));
  });
  segments.push({ type: "L", to: entry.line });
  if (rr > 0) {
    segments.push({
      type: "A",
      to: entry.circle,
      radius: rr,
      center: entry.center,
    });
  }
  segments.push({ type: "A", to: exit.circle, radius: R, center: origin });
  if (rr > 0) {
    segments.push({
      type: "A",
      to: exit.line,
      radius: rr,
      center: exit.center,
    });
  }
  return segments;
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

function wobbleLine(
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

function halfRing(Ri: number, Ro: number, G: number, r: number): Segment[] {
  const x = -G / 2 - r;
  const at = (radius: number) =>
    point(x, -Math.sqrt(radius * radius - x * x));
  const flip = (p: WedgePoint) => point(p.x, -p.y);
  const fo = at(Ro - r);
  const fi = at(Ri + r);
  const lineO = point(-G / 2, fo.y);
  const circleO = mul(fo, Ro / (Ro - r));
  const lineI = point(-G / 2, fi.y);
  const circleI = mul(fi, Ri / (Ri + r));
  return [
    { type: "M", to: lineI },
    { type: "L", to: lineO },
    { type: "A", to: circleO, radius: r, center: fo },
    { type: "A", to: flip(circleO), radius: Ro, center: origin },
    { type: "A", to: flip(lineO), radius: r, center: flip(fo) },
    { type: "L", to: flip(lineI) },
    { type: "A", to: flip(circleI), radius: r, center: flip(fi) },
    { type: "A", to: circleI, radius: Ri, center: origin },
    { type: "A", to: lineI, radius: r, center: fi },
  ];
}

function span(poly: WedgePoint[], x: number): [number, number] | null {
  const ys = poly.flatMap((a, i) => {
    const b = poly[(i + 1) % poly.length];
    if (a.x === b.x) return a.x === x ? [a.y, b.y] : [];
    const t = (x - a.x) / (b.x - a.x);
    return t >= 0 && t <= 1 ? [a.y + t * (b.y - a.y)] : [];
  });
  return ys.length ? [Math.min(...ys), Math.max(...ys)] : null;
}

type Slot = { min: WedgePoint; max: WedgePoint; area: number };

function slotBetween(
  poly: WedgePoint[],
  R: number,
  square: boolean,
  x0: number,
  x1: number,
): Slot | null {
  const s0 = span(poly, x0);
  const s1 = span(poly, x1);
  if (!s0 || !s1) return null;
  let lo = Math.max(s0[0], s1[0]);
  let hi = Math.min(s0[1], s1[1]);
  if (Math.abs(x1) < R) {
    const h = square ? R : Math.sqrt(R * R - x1 * x1);
    if (hi - Math.max(lo, h) >= Math.min(hi, -h) - lo) lo = Math.max(lo, h);
    else hi = Math.min(hi, -h);
  }
  if (hi <= lo) return null;
  return { min: point(x0, lo), max: point(x1, hi), area: (x1 - x0) * (hi - lo) };
}

function largestSlot(
  poly: WedgePoint[],
  R: number,
  square: boolean,
): Slot | null {
  if (poly.length < 3) return null;
  const xs = poly.map((p) => p.x);
  const left = Math.min(...xs);
  const right = Math.max(...xs);
  const steps = 24;
  let ranges = [
    [left, right],
    [left, right],
  ];
  let best: Slot | null = null;
  for (let pass = 0; pass < 4; pass++) {
    const [[a0, b0], [a1, b1]] = ranges;
    for (let i = 0; i <= steps; i++) {
      const x0 = a0 + ((b0 - a0) * i) / steps;
      for (let j = 0; j <= steps; j++) {
        const x1 = a1 + ((b1 - a1) * j) / steps;
        if (x1 <= x0) continue;
        const slot = slotBetween(poly, R, square, x0, x1);
        if (slot && (!best || slot.area > best.area)) best = slot;
      }
    }
    if (!best) return null;
    const found = best;
    ranges = ranges.map(([a, b], k) => {
      const at = k === 0 ? found.min.x : found.max.x;
      const reach = (b - a) / steps;
      return [Math.max(left, at - reach), Math.min(right, at + reach)];
    });
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

function serialize(segments: Segment[], transform: Transform): string {
  let d = "";
  let current = origin;
  for (const segment of segments) {
    const p = transform(segment.to);
    if (segment.type === "A" && segment.radius > 0) {
      const c = transform(segment.center);
      const sweep = cross(sub(current, c), sub(p, c)) > 0 ? 1 : 0;
      d += `A${fmt(segment.radius)} ${fmt(segment.radius)} 0 0 ${sweep} ${fmtPoint(p)}`;
    } else {
      d += `${segment.type === "M" ? "M" : "L"}${fmtPoint(p)}`;
    }
    current = p;
  }
  return `${d}Z`;
}

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
  centerShape = "circle",
  avatarRadius,
  centerGap,
  relatedGap,
  cornerRadius,
  ringThickness,
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
  const square = centerShape === "square";
  if (square && ringThickness > 0) {
    throw new RangeError("a square center cannot have a ring");
  }
  const row = orientation === "row";
  const E = (row ? width : height) / 2;
  const S = (row ? height : width) / 2;
  const center = point(width / 2, height / 2);
  const innerRadius = avatarRadius + centerGap;
  const outerRadius = innerRadius + ringThickness;
  const hasRing = ringThickness > 0;
  const cutRadius = hasRing ? outerRadius + relatedGap : innerRadius;
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
  const marks = square
    ? phis
        .slice(0, count)
        .flatMap((phi, i) =>
          squareCutPath(wedge(phi, phis[i + 1]), cutRadius, 0),
        )
        .map((segment) => segment.to)
        .filter((p) => near(chebyshev(p), cutRadius))
    : [];

  const frames = sideFrames(orientation, center.x, center.y);
  const centerOutline = (): WedgeOutline | null => {
    if (!square || count === 0) return null;
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
    return outline(
      ring.map((to, i) => ({ type: i === 0 ? "M" : "L", to })),
      (p) => p,
      bend,
    );
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
      const beyond = (p: WedgePoint) =>
        (square ? chebyshev(p) : len(p)) >= cutRadius;
      const cut = square
        ? squareCutPath(poly, cutRadius, cornerRadius, marks)
        : ringCutPath(poly, cutRadius, cornerRadius);
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
            largestSlot(
              wedge(from, to, slotInset),
              cutRadius + slotInset,
              square,
            ),
            transform,
          );
        }
        return slot;
      };
      let tilt: number | undefined;
      return [
        {
          ...outline(cut, transform, bend),
          anchor,
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
    const ring = hasRing
      ? {
          path: serialize(
            halfRing(
              innerRadius,
              outerRadius,
              centerGap,
              Math.min(cornerRadius, ringThickness / 2),
            ),
            transform,
          ),
        }
      : null;
    let expandedSlot: WedgeRect | null | undefined;
    return {
      wedges,
      ring,
      get expandedSlot() {
        if (expandedSlot === undefined) {
          expandedSlot =
            count > 0
              ? slotRect(
                  largestSlot(
                    wedge(0, Math.PI, slotInset),
                    cutRadius + slotInset,
                    square,
                  ),
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
