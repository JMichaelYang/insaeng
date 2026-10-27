"use client";

import { useMemo, useRef, type ComponentProps } from "react";

import { mergeClasses } from "../../utils/merge-classes";
import { useFrame } from "./use-frame";
import type { WedgeWobble } from "../../organisms/wedges/wedge-geometry";
import { wobbleCircle } from "./wobble-circle";
import { wobbleRect, type WobbleEdges } from "./wobble-rect";

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
  shape = "rect",
  lineClassName = "stroke-on-surface",
  strokeWidth = 2,
  lgStrokeWidth = 3,
  className,
  children,
  ...props
}: Omit<ComponentProps<"div">, "ref"> & {
  wobble: WedgeWobble;
  lgWobble?: WedgeWobble;
  edges?: WobbleEdges;
  shape?: "rect" | "circle";
  lineClassName?: string;
  strokeWidth?: number;
  lgStrokeWidth?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const frame = useFrame(ref);

  const outline = useMemo(() => {
    if (!frame || frame.width <= 0 || frame.height <= 0) return null;
    const box = {
      width: frame.width,
      height: frame.height,
      wobble: frame.lg ? lgWobble : wobble,
    };
    return shape === "circle" ? wobbleCircle(box) : wobbleRect({ ...box, edges });
  }, [frame, wobble, lgWobble, edges, shape]);

  return (
    <div
      ref={ref}
      className={mergeClasses("relative", className)}
      {...props}
    >
      <div
        className="size-full"
        style={outline ? { clipPath: `path("${outline.path}")` } : undefined}
      >
        {children}
      </div>
      {outline?.lines && (
        <svg
          className="
            pointer-events-none absolute inset-0 size-full overflow-visible
          "
          aria-hidden
        >
          <path
            className={mergeClasses("fill-none", lineClassName)}
            d={outline.lines}
            strokeWidth={frame?.lg ? lgStrokeWidth : strokeWidth}
            strokeLinejoin="round"
          />
        </svg>
      )}
    </div>
  );
}
