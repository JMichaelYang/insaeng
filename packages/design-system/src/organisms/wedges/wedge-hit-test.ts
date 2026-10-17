import type { WedgeGeometry } from "./wedge-geometry";

const hoverSlop = 8;

export const wedgeKey = (side: number, index: number) => `${side}-${index}`;

let hitContext: CanvasRenderingContext2D | null | undefined;

function contains(path: string | undefined, x: number, y: number, slop = 0) {
  if (!path) return false;
  hitContext ??= document.createElement("canvas").getContext("2d");
  if (!hitContext) return false;
  const shape = new Path2D(path);
  if (hitContext.isPointInPath(shape, x, y)) return true;
  if (slop <= 0) return false;
  hitContext.lineWidth = slop * 2;
  return hitContext.isPointInStroke(shape, x, y);
}

export function pickWedge(
  rest: WedgeGeometry,
  geometry: WedgeGeometry | null,
  hovered: string | null,
  x: number,
  y: number,
) {
  const wedges = rest.sides.flatMap((side, s) =>
    side.wedges.map((wedge, i) => ({
      key: wedgeKey(s, i),
      resting: wedge.path,
      current: geometry?.sides[s].wedges[i]?.path,
    })),
  );
  const inside = wedges.find(({ resting }) => contains(resting, x, y));
  const slop = inside ? hoverSlop : 0;
  const kept = wedges.find(
    ({ key, resting, current }) =>
      key === hovered &&
      (contains(current, x, y) || contains(resting, x, y, slop)),
  );
  return (kept ?? inside)?.key ?? null;
}
