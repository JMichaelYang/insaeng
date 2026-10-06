"use client";

import {
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { mergeClasses } from "../utils/merge-classes";
import {
  wedgeGeometry,
  type WedgeGeometryOptions,
  type WedgeOrientation,
} from "../utils/wedge-geometry";
import { Wedge } from "../molecules/wedge";

export type WedgesLayout = Omit<
  WedgeGeometryOptions,
  "width" | "height" | "orientation" | "expansion"
>;

type Frame = { width: number; height: number; orientation: WedgeOrientation };

export type WedgeLabels = readonly [string, string];

const labelStrokeWidth = 1;

const rowQuery = "(min-width: 64rem)";

export function Wedges({
  row,
  column,
  labels,
  className,
  children,
}: {
  row: WedgesLayout;
  column: WedgesLayout;
  labels?: WedgeLabels;
  className?: string;
  children?: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();
  const [frame, setFrame] = useState<Frame | null>(null);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    const media = window.matchMedia(rowQuery);
    const measure = () => {
      const { width, height } = element.getBoundingClientRect();
      const orientation = media.matches ? "row" : "column";
      setFrame((prev) =>
        prev &&
        prev.width === width &&
        prev.height === height &&
        prev.orientation === orientation
          ? prev
          : { width, height, orientation },
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

  const geometry = useMemo(() => {
    if (!frame || frame.width <= 0 || frame.height <= 0) return null;
    return wedgeGeometry({
      ...(frame.orientation === "row" ? row : column),
      ...frame,
    });
  }, [frame, row, column]);

  return (
    <div
      ref={ref}
      className={mergeClasses("relative flex items-center justify-center", className)}
    >
      {frame && geometry && (
        <svg
          className="absolute inset-0 size-full"
          width={frame.width}
          height={frame.height}
          viewBox={`0 0 ${frame.width} ${frame.height}`}
          aria-hidden
        >
          {geometry.sides.map((side, s) => (
            <g key={s}>
              {side.ring && <Wedge path={side.ring.path} />}
              {side.ring && labels?.[s] && (
                <>
                  <defs>
                    <path id={`${id}-label-${s}`} d={side.ring.textPath} />
                  </defs>
                  <text
                    className={mergeClasses(
                      "fill-none stroke-on-surface",
                      frame.orientation === "row"
                        ? "type-heading-xl"
                        : "font-display text-3xl",
                    )}
                    strokeWidth={labelStrokeWidth}
                    textAnchor="middle"
                    dominantBaseline="central"
                  >
                    <textPath href={`#${id}-label-${s}`} startOffset="50%">
                      {labels[s]}
                    </textPath>
                  </text>
                </>
              )}
              {side.wedges.map((wedge, i) => (
                <Wedge key={i} path={wedge.path} />
              ))}
            </g>
          ))}
        </svg>
      )}
      <div className="relative">{children}</div>
    </div>
  );
}
