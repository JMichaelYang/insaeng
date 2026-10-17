"use client";

import {
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
} from "react";

import { mergeClasses } from "../utils/merge-classes";
import type { WedgeWobble } from "../organisms/wedges/wedge-geometry";
import { wobbleRect, type WobbleEdges } from "../utils/wobble-rect";

const lgQuery = "(min-width: 64rem)";
const strokeWidth = 4;
const allEdges: WobbleEdges = {
  top: true,
  right: true,
  bottom: true,
  left: true,
};

type Frame = { width: number; height: number; lg: boolean };

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
  const [frame, setFrame] = useState<Frame | null>(null);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    const media = window.matchMedia(lgQuery);
    const measure = () => {
      const { width, height } = element.getBoundingClientRect();
      const lg = media.matches;
      setFrame((prev) =>
        prev &&
        prev.width === width &&
        prev.height === height &&
        prev.lg === lg
          ? prev
          : { width, height, lg },
      );
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    media.addEventListener("change", measure);
    return () => {
      observer.disconnect();
      media.removeEventListener("change", measure);
    };
  }, []);

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
