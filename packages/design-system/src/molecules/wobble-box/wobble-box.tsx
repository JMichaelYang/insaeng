"use client";

import { useMemo, useRef, type ComponentProps } from "react";

import { mergeClasses } from "../../utils/merge-classes";
import { useFrame } from "./use-frame";
import type { WedgeWobble } from "../../organisms/wedges/wedge-geometry";
import { wobbleRect, type WobbleEdges } from "./wobble-rect";

const strokeWidth = 4;
const allEdges: WobbleEdges = {
  top: true,
  right: true,
  bottom: true,
  left: true,
};

export function WobbleBox({
  wobble,
  lgWobble = wobble,
  edges = allEdges,
  className,
  children,
  ...props
}: Omit<ComponentProps<"div">, "ref"> & {
  wobble: WedgeWobble;
  lgWobble?: WedgeWobble;
  edges?: WobbleEdges;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const frame = useFrame(ref);

  const shape = useMemo(() => {
    if (!frame || frame.width <= 0 || frame.height <= 0) return null;
    return wobbleRect({
      width: frame.width,
      height: frame.height,
      wobble: frame.lg ? lgWobble : wobble,
      edges,
    });
  }, [frame, wobble, lgWobble, edges]);

  return (
    <div
      ref={ref}
      className={mergeClasses("relative", className)}
      {...props}
    >
      <div
        className="size-full"
        style={shape ? { clipPath: `path("${shape.path}")` } : undefined}
      >
        {children}
      </div>
      {shape?.lines && (
        <svg
          className="
            pointer-events-none absolute inset-0 size-full overflow-visible
          "
          aria-hidden
        >
          <path
            className="fill-none stroke-on-surface"
            d={shape.lines}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
          />
        </svg>
      )}
    </div>
  );
}
