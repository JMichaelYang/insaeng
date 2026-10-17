"use client";

import { useMemo, useRef } from "react";

import { mergeClasses } from "../utils/merge-classes";
import { useFrame } from "../utils/use-frame";
import type { WedgeWobble } from "../organisms/wedges/wedge-geometry";
import { wobblePill } from "../utils/wobble-pill";

export function WobblePill({
  wobble,
  lgWobble = wobble,
  strokeWidth = 4,
  className,
}: {
  wobble: WedgeWobble;
  lgWobble?: WedgeWobble;
  strokeWidth?: number;
  className?: string;
}) {
  const ref = useRef<SVGSVGElement>(null);
  const frame = useFrame(ref);

  const path = useMemo(() => {
    if (!frame || frame.width <= 0 || frame.height <= 0) return "";
    return wobblePill({
      width: frame.width,
      height: frame.height,
      wobble: frame.lg ? lgWobble : wobble,
    });
  }, [frame, wobble, lgWobble]);

  return (
    <svg
      ref={ref}
      className={mergeClasses(
        "pointer-events-none absolute inset-0 size-full overflow-visible",
        className,
      )}
      aria-hidden
    >
      {path && (
        <path
          className="fill-none stroke-current"
          d={path}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}
