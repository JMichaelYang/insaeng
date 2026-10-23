import { type WedgePoint, type WedgeWobble, wobbleCircle as wobbleRing } from "../../organisms/wedges/wedge-geometry";
import type { WobbleRect } from "./wobble-rect";

const fmt = (n: number) => String(Math.round(n * 100) / 100);
const fmtPoint = (p: WedgePoint) => `${fmt(p.x)} ${fmt(p.y)}`;

export function wobbleCircle({
  width,
  height,
  wobble,
}: {
  width: number;
  height: number;
  wobble: WedgeWobble;
}): WobbleRect {
  const ring = wobbleRing(
    { x: width / 2, y: height / 2 },
    Math.min(width, height) / 2 - wobble.amplitude,
    wobble,
  );
  if (ring.length === 0) return { path: "", lines: "" };
  const path = `${ring.map((p, i) => `${i === 0 ? "M" : "L"}${fmtPoint(p)}`).join("")}Z`;
  return { path, lines: path };
}
