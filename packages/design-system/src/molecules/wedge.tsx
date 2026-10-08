import { useId } from "react";

import { mergeClasses } from "../utils/merge-classes";

const strokeWidth = 2;

export function Wedge({
  path,
  focused = false,
  className,
}: {
  path: string;
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
