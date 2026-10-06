"use client";

import {
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { cn } from "../lib/cn";
import {
  wedgeGeometry,
  type WedgeGeometryOptions,
  type WedgeOrientation,
} from "../lib/wedge-geometry";
import { Wedge } from "../molecules/wedge";

export type WedgesLayout = Omit<
  WedgeGeometryOptions,
  "width" | "height" | "orientation" | "expansion"
>;

type Frame = { width: number; height: number; orientation: WedgeOrientation };

const rowQuery = "(min-width: 64rem)";

export function Wedges({
  row,
  column,
  className,
  children,
}: {
  row: WedgesLayout;
  column: WedgesLayout;
  className?: string;
  children?: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
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
      className={cn("relative flex items-center justify-center", className)}
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
