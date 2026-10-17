import type { WedgePoint, WedgeWobble } from "../organisms/wedges/wedge-geometry";

const step = 2;

const fmt = (n: number) => String(Math.round(n * 100) / 100);
const fmtPoint = (p: WedgePoint) => `${fmt(p.x)} ${fmt(p.y)}`;

export function wobblePill({
  width,
  height,
  wobble,
}: {
  width: number;
  height: number;
  wobble: WedgeWobble;
}): string {
  const { amplitude, wavelength } = wobble;
  const w = width - 2 * amplitude;
  const h = height - 2 * amplitude;
  if (!(w > 0 && h > 0)) return "";
  const r = Math.min(w, h) / 2;
  const straight = w - 2 * r;
  const arc = Math.PI * r;
  const length = 2 * straight + 2 * arc;
  const left = amplitude + r;
  const right = amplitude + r + straight;
  const middle = amplitude + h / 2;
  const at = (s: number): [WedgePoint, WedgePoint] => {
    if (s < straight) {
      return [{ x: left + s, y: amplitude }, { x: 0, y: -1 }];
    }
    s -= straight;
    if (s < arc) {
      const theta = -Math.PI / 2 + s / r;
      const n = { x: Math.cos(theta), y: Math.sin(theta) };
      return [{ x: right + r * n.x, y: middle + r * n.y }, n];
    }
    s -= arc;
    if (s < straight) {
      return [{ x: right - s, y: amplitude + h }, { x: 0, y: 1 }];
    }
    s -= straight;
    const theta = Math.PI / 2 + s / r;
    const n = { x: Math.cos(theta), y: Math.sin(theta) };
    return [{ x: left + r * n.x, y: middle + r * n.y }, n];
  };
  const cycles =
    wavelength > 0 ? Math.max(1, Math.round(length / wavelength)) : 0;
  const count = Math.ceil(length / step);
  const points = Array.from({ length: count }, (_, i) => {
    const s = (i / count) * length;
    const [p, n] = at(s);
    const offset = amplitude * Math.sin((2 * Math.PI * cycles * s) / length);
    return { x: p.x + n.x * offset, y: p.y + n.y * offset };
  });
  const [first, ...rest] = points;
  return `M${fmtPoint(first)}${rest.map((p) => `L${fmtPoint(p)}`).join("")}Z`;
}
