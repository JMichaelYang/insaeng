import { mergeClasses } from "../../utils/merge-classes";

const fadeExtent = "100%";
const fadeStops = [
  [0, 75],
  [0.2, 69],
  [0.35, 65],
  [0.5, 61],
  [0.65, 57],
  [0.8, 54],
  [1, 50],
] as const;

function fadeGradient(radius: number) {
  const stops = fadeStops.map(
    ([at, opacity]) =>
      `color-mix(in srgb, var(--color-surface) ${opacity}%, transparent) calc(${radius}px + (${fadeExtent} - ${radius}px) * ${at})`,
  );
  return `radial-gradient(circle farthest-side at 50% 50%, ${stops.join(", ")})`;
}

export function Fade({
  radius,
  className,
}: {
  radius: number;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={mergeClasses("absolute inset-0", className)}
      style={{ backgroundImage: fadeGradient(radius) }}
    />
  );
}
