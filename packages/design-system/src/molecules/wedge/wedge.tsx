import { useId, type ReactNode } from "react";

import { Image, type ImageBlur, type ImageSource } from "../../atoms/image";
import { mergeClasses } from "../../utils/merge-classes";
import type { WedgeRect } from "../../organisms/wedges/wedge-geometry";

const strokeWidth = 2;
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

export function Wedge({
  path,
  lines,
  image,
  bounds,
  blur,
  fade,
  focused = false,
  className,
}: {
  path: string;
  lines?: string;
  image?: ImageSource;
  bounds?: WedgeRect;
  blur?: ImageBlur;
  fade?: number;
  focused?: boolean;
  className?: string;
}) {
  const bleed =blur ? `var(--blur-${blur}) * 3` : "0px";
  return (
    <>
      <div
        className={mergeClasses(
          "absolute inset-0 overflow-hidden bg-surface-container-lowest",
          className,
        )}
        style={{ clipPath: `path("${path}")` }}
      >
        {image && bounds && (
          <Image
            source={image}
            blur={blur}
            alt=""
            draggable={false}
            className="absolute max-w-none object-cover"
            style={{
              left: `calc(${bounds.x}px - ${bleed})`,
              top: `calc(${bounds.y}px - ${bleed})`,
              width: `calc(${bounds.width}px + ${bleed} * 2)`,
              height: `calc(${bounds.height}px + ${bleed} * 2)`,
            }}
          />
        )}
        {fade !== undefined && (
          <div
            className="absolute inset-0"
            style={{ backgroundImage: fadeGradient(fade) }}
          />
        )}
      </div>
      <WedgeLines path={path} lines={lines} focused={focused} />
    </>
  );
}

export function WedgeLines({
  path,
  lines,
  focused = false,
}: {
  path: string;
  lines?: string;
  focused?: boolean;
}) {
  const id = useId();
  if (!lines && !focused) return null;
  return (
    <svg
      className="pointer-events-none absolute inset-0 size-full"
      aria-hidden
    >
      <clipPath id={id}>
        <path d={path} />
      </clipPath>
      {lines && (
        <path
          className="fill-none stroke-on-surface"
          d={lines}
          strokeWidth={strokeWidth * 2}
          strokeLinecap="round"
          strokeLinejoin="round"
          clipPath={`url(#${id})`}
        />
      )}
      {focused && (
        <path
          className="fill-none stroke-secondary"
          d={path}
          strokeWidth={strokeWidth * 2}
          clipPath={`url(#${id})`}
        />
      )}
    </svg>
  );
}

export function WedgeSlot({
  slot,
  tilt,
  children,
}: {
  slot: WedgeRect;
  tilt?: number;
  children: ReactNode;
}) {
  return (
    <div
      className="absolute flex items-center justify-center overflow-hidden"
      style={{
        left: slot.x,
        top: slot.y,
        width: slot.width,
        height: slot.height,
      }}
    >
      {tilt === undefined ? (
        children
      ) : (
        <div style={{ rotate: `${tilt}deg` }}>{children}</div>
      )}
    </div>
  );
}
