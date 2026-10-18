import type { WedgeOrientation } from "./wedge-geometry";

type Placed<T> = (T | undefined)[];

export function orderWedges<T>(
  sides: readonly [readonly T[], readonly T[]],
  orientation: WedgeOrientation,
  wedgesPerSide: number,
): [Placed<T>, Placed<T>] {
  const [left, right] = sides.map((side) =>
    Array.from({ length: wedgesPerSide }, (_, i) => side[i]),
  );
  if (orientation === "row") return [left, right];
  const ring = [...right, ...left.toReversed()];
  const shift = Math.floor(wedgesPerSide / 2);
  const turned = ring.map(
    (_, k) => ring[(k - shift + ring.length) % ring.length],
  );
  return [
    turned.slice(0, wedgesPerSide),
    turned.slice(wedgesPerSide).toReversed(),
  ];
}
