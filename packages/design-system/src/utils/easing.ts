export type Easing = (progress: number) => number;

export const linear: Easing = (progress) => progress;

export function cubicBezier(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): Easing {
  const at = (a: number, b: number, t: number) =>
    3 * a * t * (1 - t) ** 2 + 3 * b * (1 - t) * t * t + t ** 3;
  return (progress) => {
    if (progress <= 0) return 0;
    if (progress >= 1) return 1;
    let lo = 0;
    let hi = 1;
    for (let i = 0; i < 32; i++) {
      const mid = (lo + hi) / 2;
      if (at(x1, x2, mid) < progress) lo = mid;
      else hi = mid;
    }
    return at(y1, y2, (lo + hi) / 2);
  };
}

export function parseCubicBezier(value: string): Easing | null {
  const match = /^cubic-bezier\(([^)]*)\)$/.exec(value.trim());
  if (!match) return null;
  const args = match[1].split(",").map((arg) => Number(arg.trim()));
  if (args.length !== 4 || !args.every(Number.isFinite)) return null;
  const [x1, y1, x2, y2] = args;
  if (x1 < 0 || x1 > 1 || x2 < 0 || x2 > 1) return null;
  return cubicBezier(x1, y1, x2, y2);
}

export function parseDuration(value: string): number | null {
  const match = /^(\d*\.?\d+)(ms|s)$/.exec(value.trim());
  if (!match) return null;
  const amount = Number(match[1]);
  return match[2] === "s" ? amount * 1000 : amount;
}
