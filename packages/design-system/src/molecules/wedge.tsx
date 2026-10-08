import { useId } from "react";

import { mergeClasses } from "../utils/merge-classes";
import type { WedgeRect } from "../utils/wedge-geometry";

const strokeWidth = 2;

export function Wedge({
  path,
  image,
  bounds,
  focused = false,
  className,
}: {
  path: string;
  image?: string;
  bounds?: WedgeRect;
  focused?: boolean;
  className?: string;
}) {
  const id = useId();
  return (
    <g className={className}>
      <clipPath id={id}>
        <path d={path} />
      </clipPath>
      <path className="fill-surface-container-lowest" d={path} />
      {image && bounds && (
        <image
          href={image}
          x={bounds.x}
          y={bounds.y}
          width={bounds.width}
          height={bounds.height}
          preserveAspectRatio="xMidYMid slice"
          clipPath={`url(#${id})`}
        />
      )}
      <path
        className={mergeClasses(
          "fill-none",
          focused ? "stroke-secondary" : "stroke-outline",
        )}
        d={path}
        strokeWidth={strokeWidth * 2}
        clipPath={`url(#${id})`}
      />
    </g>
  );
}
