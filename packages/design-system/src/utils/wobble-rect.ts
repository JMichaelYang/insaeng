import { type WedgePoint, type WedgeWobble, wobbleLine } from "../organisms/wedges/wedge-geometry";

export type WobbleEdges = {
  top?: boolean;
  right?: boolean;
  bottom?: boolean;
  left?: boolean;
};

export type WobbleRect = { path: string; lines: string };

const fmt = (n: number) => String(Math.round(n * 100) / 100);
const fmtPoint = (p: WedgePoint) => `${fmt(p.x)} ${fmt(p.y)}`;

export function wobbleRect({
  width,
  height,
  wobble,
  edges,
}: {
  width: number;
  height: number;
  wobble: WedgeWobble;
  edges: WobbleEdges;
}): WobbleRect {
  const inset = (wobbly?: boolean) => (wobbly ? wobble.amplitude : 0);
  const left = inset(edges.left);
  const top = inset(edges.top);
  const right = width - inset(edges.right);
  const bottom = height - inset(edges.bottom);
  const corners: WedgePoint[] = [
    { x: left, y: top },
    { x: right, y: top },
    { x: right, y: bottom },
    { x: left, y: bottom },
  ];
  const sides = [edges.top, edges.right, edges.bottom, edges.left];
  let path = `M${fmtPoint(corners[0])}`;
  let lines = "";
  sides.forEach((wobbly, i) => {
    const from = corners[i];
    const to = corners[(i + 1) % corners.length];
    const d = [...(wobbly ? wobbleLine(from, to, wobble) : []), to]
      .map((p) => `L${fmtPoint(p)}`)
      .join("");
    path += d;
    if (!wobbly) return;
    if (i === 0 || !sides[i - 1]) lines += `M${fmtPoint(from)}`;
    lines += d;
  });
  return {
    path: `${path}Z`,
    lines: sides.every(Boolean) ? `${lines}Z` : lines,
  };
}
