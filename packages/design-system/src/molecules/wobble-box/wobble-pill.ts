import { type WedgePoint, type WedgeWobble, wobbleStep } from "../../organisms/wedges/wedge-geometry";
import type { WobbleRect } from "./wobble-rect";

const fmt = (n: number) => String(Math.round(n * 100) / 100);
const fmtPoint = (p: WedgePoint) => `${fmt(p.x)} ${fmt(p.y)}`;

type Spot = { center: WedgePoint; angle: number; shift: number };

export function wobblePill({
  width,
  height,
  wobble,
}: {
  width: number;
  height: number;
  wobble: WedgeWobble;
}): WobbleRect {
  const wavy = wobble.amplitude > 0 && wobble.wavelength > 0;
  const amplitude = wavy ? wobble.amplitude : 0;
  const end = Math.min(width, height) / 2;
  const radius = end - amplitude;
  if (radius <= 0) return { path: "", lines: "" };
  const straight = Math.max(0, width - height);
  const left = { x: end, y: height / 2 };
  const right = { x: end + straight, y: height / 2 };
  const quarter = (Math.PI * radius) / 2;
  const perimeter = 4 * quarter + 2 * straight;
  const cycles = wavy
    ? 2 * Math.max(1, Math.round(perimeter / (2 * wobble.wavelength)))
    : 0;
  const samples = 4 * Math.max(1, Math.ceil(perimeter / (4 * wobbleStep)));
  const spotAt = (s: number): Spot => {
    if (s < quarter) return { center: right, angle: s / radius, shift: 0 };
    s -= quarter;
    if (s < straight) return { center: right, angle: Math.PI / 2, shift: -s };
    s -= straight;
    if (s < 2 * quarter) {
      return { center: left, angle: Math.PI / 2 + s / radius, shift: 0 };
    }
    s -= 2 * quarter;
    if (s < straight) return { center: left, angle: 1.5 * Math.PI, shift: s };
    s -= straight;
    return { center: right, angle: 1.5 * Math.PI + s / radius, shift: 0 };
  };
  const ring = Array.from({ length: samples }, (_, i) => {
    const s = (i * perimeter) / samples;
    const { center, angle, shift } = spotAt(s);
    const r =
      radius + amplitude * Math.cos((2 * Math.PI * cycles * s) / perimeter);
    return {
      x: center.x + shift + r * Math.cos(angle),
      y: center.y + r * Math.sin(angle),
    };
  });
  const path = `${ring.map((p, i) => `${i === 0 ? "M" : "L"}${fmtPoint(p)}`).join("")}Z`;
  return { path, lines: path };
}
