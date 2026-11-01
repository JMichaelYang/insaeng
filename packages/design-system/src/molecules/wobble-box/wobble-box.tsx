"use client";

import { useMemo, useRef, type ComponentProps, type CSSProperties } from "react";

import { mergeClasses } from "../../utils/merge-classes";
import { useFrame } from "./use-frame";
import type { WedgeWobble } from "../../organisms/wedges/wedge-geometry";
import { wobbleCircle } from "./wobble-circle";
import { wobblePill } from "./wobble-pill";
import { wobbleRect, type WobbleEdges } from "./wobble-rect";

const strokeWidth = 2;
const lgStrokeWidth = 3;
const allEdges: WobbleEdges = {
  top: true,
  right: true,
  bottom: true,
  left: true,
};

function clipStyle(
  clip: "children" | "state-layer",
  path: string,
): CSSProperties {
  const value = `path("${path}")`;
  return clip === "children"
    ? { clipPath: value }
    : ({ "--state-layer-clip": value } as CSSProperties);
}

export function WobbleBox({
  wobble,
  lgWobble = wobble,
  edges = allEdges,
  shape = "rect",
  lineClassName = "stroke-on-surface",
  outlined = true,
  clip = "children",
  className,
  children,
  ...props
}: Omit<ComponentProps<"div">, "ref"> & {
  wobble: WedgeWobble;
  lgWobble?: WedgeWobble;
  edges?: WobbleEdges;
  shape?: "rect" | "circle" | "pill";
  lineClassName?: string;
  outlined?: boolean;
  clip?: "children" | "state-layer";
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
    if (shape === "circle") return wobbleCircle(box);
    if (shape === "pill") return wobblePill(box);
    return wobbleRect({ ...box, edges });
  }, [frame, wobble, lgWobble, edges, shape]);

  return (
    <div
      ref={ref}
      className={mergeClasses("relative", className)}
      {...props}
    >
      <div
        className="size-full"
        style={outline ? clipStyle(clip, outline.path) : undefined}
      >
        {children}
      </div>
      {outlined && outline?.lines && (
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
