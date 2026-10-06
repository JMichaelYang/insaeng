export type WedgePoint = { x: number; y: number };

export type WedgeOrientation = "row" | "column";

export type WedgeGeometryOptions = {
  width: number;
  height: number;
  orientation: WedgeOrientation;
  avatarRadius: number;
  centerGap: number;
  relatedGap: number;
  cornerRadius: number;
  ringThickness: number;
  wedgesPerSide: number;
  spread: number;
  expansion?: readonly [readonly number[], readonly number[]];
};

export type WedgeShape = { path: string; anchor: WedgePoint };

export type WedgeRing = { path: string; textPath: string };

export type WedgeSide = { wedges: WedgeShape[]; ring: WedgeRing | null };

export type WedgeGeometry = {
  cutRadius: number;
  sides: [WedgeSide, WedgeSide];
};

type Plane = { n: WedgePoint; c: number };

type Segment =
  | { type: "M" | "L"; to: WedgePoint }
  | { type: "A"; to: WedgePoint; radius: number; center: WedgePoint };

type Transform = (p: WedgePoint) => WedgePoint;

type SideFrame = {
  transform: Transform;
  labelDegrees: number;
  clockwise: boolean;
};

const point = (x: number, y: number): WedgePoint => ({ x, y });
const add = (a: WedgePoint, b: WedgePoint) => point(a.x + b.x, a.y + b.y);
const sub = (a: WedgePoint, b: WedgePoint) => point(a.x - b.x, a.y - b.y);
const mul = (a: WedgePoint, k: number) => point(a.x * k, a.y * k);
const dot = (a: WedgePoint, b: WedgePoint) => a.x * b.x + a.y * b.y;
const cross = (a: WedgePoint, b: WedgePoint) => a.x * b.y - a.y * b.x;
const len = (a: WedgePoint) => Math.hypot(a.x, a.y);
const norm = (a: WedgePoint) => mul(a, 1 / len(a));
const origin = point(0, 0);

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
  const entry = fillet(a0, u0, point(-u0.y, u0.x), R, r);
  const b1 = poly[(m + 1) % n];
  const u1 = norm(sub(poly[m], b1));
  const exit = fillet(b1, u1, point(u1.y, -u1.x), R, r);
  const outside: WedgePoint[] = [];
  for (let i = (m + 1) % n; i !== k; i = (i + 1) % n) outside.push(poly[i]);
  const segments: Segment[] = [{ type: "M", to: exit.line }];
  outside.forEach((v, i) => {
    const prev = i === 0 ? exit.line : outside[i - 1];
    const next = i === outside.length - 1 ? entry.line : outside[i + 1];
    segments.push(...corner(v, prev, next, r));
  });
  segments.push({ type: "L", to: entry.line });
  if (r > 0) {
    segments.push({
      type: "A",
      to: entry.circle,
      radius: r,
      center: entry.center,
    });
  }
  segments.push({ type: "A", to: exit.circle, radius: R, center: origin });
  if (r > 0) {
    segments.push({ type: "A", to: exit.line, radius: r, center: exit.center });
  }
  return segments;
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
): [SideFrame, SideFrame] {
  if (orientation === "row") {
    return [
      {
        transform: (p) => point(cx + p.x, cy + p.y),
        labelDegrees: 180,
        clockwise: true,
      },
      {
        transform: (p) => point(cx - p.x, cy + p.y),
        labelDegrees: 0,
        clockwise: true,
      },
    ];
  }
  return [
    {
      transform: (p) => point(cx + p.y, cy + p.x),
      labelDegrees: 270,
      clockwise: true,
    },
    {
      transform: (p) => point(cx + p.y, cy - p.x),
      labelDegrees: 90,
      clockwise: false,
    },
  ];
}

function labelPath(
  center: WedgePoint,
  radius: number,
  degrees: number,
  clockwise: boolean,
): string {
  const at = (deg: number) => {
    const rad = (deg * Math.PI) / 180;
    return point(
      center.x + radius * Math.cos(rad),
      center.y + radius * Math.sin(rad),
    );
  };
  const from = at(degrees + (clockwise ? -80 : 80));
  const to = at(degrees + (clockwise ? 80 : -80));
  return `M${fmtPoint(from)}A${fmt(radius)} ${fmt(radius)} 0 0 ${clockwise ? 1 : 0} ${fmtPoint(to)}`;
}

export function wedgeGeometry({
  width,
  height,
  orientation,
  avatarRadius,
  centerGap,
  relatedGap,
  cornerRadius,
  ringThickness,
  wedgesPerSide,
  spread,
  expansion,
}: WedgeGeometryOptions): WedgeGeometry {
  if (!Number.isInteger(wedgesPerSide) || wedgesPerSide < 1) {
    throw new RangeError("wedgesPerSide must be a positive integer");
  }
  const row = orientation === "row";
  const E = (row ? width : height) / 2;
  const S = (row ? height : width) / 2;
  const center = point(width / 2, height / 2);
  const innerRadius = avatarRadius + centerGap;
  const outerRadius = innerRadius + ringThickness;
  const hasRing = ringThickness > 0;
  const cutRadius = hasRing ? outerRadius + relatedGap : innerRadius;

  const hits =
    wedgesPerSide === 2
      ? [0]
      : Array.from(
          { length: wedgesPerSide - 1 },
          (_, k) =>
            -spread * S + (k * 2 * spread * S) / (wedgesPerSide - 2),
        );
  const phis = [0, ...hits.map((y) => Math.atan2(E, -y)), Math.PI];
  const box = [
    point(-E, -S),
    point(-centerGap / 2, -S),
    point(-centerGap / 2, S),
    point(-E, S),
  ];
  const halfPlane = (phi: number, sign: number): Plane => ({
    n: point(sign * Math.cos(phi), -sign * Math.sin(phi)),
    c: -relatedGap / 2,
  });
  const wedge = (a: number, b: number) =>
    [halfPlane(a, 1), halfPlane(b, -1)].reduce(clip, box);

  const frames = sideFrames(orientation, center.x, center.y);
  const sides = frames.map(({ transform, labelDegrees, clockwise }, s) => {
    const wedges = Array.from({ length: wedgesPerSide }, (_, i) => {
      const raw = expansion?.[s]?.[i] ?? 0;
      const e = Math.max(0, Math.min(1, raw));
      const a = phis[i] * (1 - e);
      const b = phis[i + 1] + (Math.PI - phis[i + 1]) * e;
      const poly = wedge(a, b);
      const far = centroid(poly.filter((p) => len(p) >= cutRadius));
      const anchor = transform(mul(norm(far), (cutRadius + len(far)) / 2));
      return {
        path: serialize(ringCutPath(poly, cutRadius, cornerRadius), transform),
        anchor,
      };
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
          textPath: labelPath(
            center,
            (innerRadius + outerRadius) / 2,
            labelDegrees,
            clockwise,
          ),
        }
      : null;
    return { wedges, ring };
  });

  return { cutRadius, sides: [sides[0], sides[1]] };
}
