"use client";

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent,
  type ReactNode,
  type RefObject,
} from "react";

import { linear, parseCubicBezier, parseDuration } from "../utils/easing";
import { mergeClasses } from "../utils/merge-classes";
import {
  wedgeGeometry,
  type WedgeGeometryOptions,
  type WedgeOrientation,
} from "../utils/wedge-geometry";
import type { ImageBlur, ImageSource } from "../atoms/image";
import { Wedge } from "../molecules/wedge";

export type WedgesLayout = Omit<
  WedgeGeometryOptions,
  "width" | "height" | "orientation" | "expansion"
>;

export type WedgesContent = readonly [
  readonly ReactNode[],
  readonly ReactNode[],
];

export type WedgesImages = readonly [
  readonly ImageSource[],
  readonly ImageSource[],
];

type Frame = { width: number; height: number; orientation: WedgeOrientation };

type Hold = {
  key: string;
  pointerId: number;
  x: number;
  y: number;
  timer: number | null;
};

const rowQuery = "(min-width: 64rem)";
const reducedMotionQuery = "(prefers-reduced-motion: reduce)";
const holdDelay = 350;
const holdSlop = 10;

const wedgeKey = (side: number, index: number) => `${side}-${index}`;

function readMotion(element: Element) {
  if (window.matchMedia(reducedMotionQuery).matches) {
    return { duration: 0, ease: linear };
  }
  const style = getComputedStyle(element);
  return {
    duration:
      parseDuration(style.getPropertyValue("--transition-duration-slow")) ?? 0,
    ease: parseCubicBezier(style.getPropertyValue("--ease-standard")) ?? linear,
  };
}

function useExpansion(
  active: string | null,
  ref: RefObject<HTMLElement | null>,
) {
  const [values, setValues] = useState<ReadonlyMap<string, number>>(
    () => new Map(),
  );
  const current = useRef(values);

  useEffect(() => {
    const element = ref.current;
    const from = new Map(current.current);
    if (active !== null) {
      const value = from.get(active) ?? 0;
      from.delete(active);
      from.set(active, value);
    }
    if (!element || from.size === 0) return;
    const { duration, ease } = readMotion(element);
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const progress =
        duration > 0 ? Math.min(1, Math.max(0, (now - start) / duration)) : 1;
      const t = ease(progress);
      const next = new Map<string, number>();
      from.forEach((value, key) => {
        const target = key === active ? 1 : 0;
        const eased = value + (target - value) * t;
        if (eased > 0) next.set(key, eased);
      });
      current.current = next;
      setValues(next);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, ref]);

  return values;
}

export function Wedges({
  row,
  column,
  content,
  images,
  blur,
  className,
  children,
}: {
  row: WedgesLayout;
  column: WedgesLayout;
  content?: WedgesContent;
  images?: WedgesImages;
  blur?: ImageBlur;
  className?: string;
  children?: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const hold = useRef<Hold | null>(null);
  const [frame, setFrame] = useState<Frame | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [held, setHeld] = useState<string | null>(null);
  const [focused, setFocused] = useState<string | null>(null);
  const expansion = useExpansion(held ?? hovered ?? focused, ref);

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

  useEffect(
    () => () => {
      const timer = hold.current?.timer;
      if (timer != null) window.clearTimeout(timer);
    },
    [],
  );

  const layout = frame?.orientation === "row" ? row : column;

  const rest = useMemo(() => {
    if (!frame || frame.width <= 0 || frame.height <= 0) return null;
    return wedgeGeometry({ ...layout, ...frame });
  }, [frame, layout]);

  const geometry = useMemo(() => {
    if (!frame || !rest || expansion.size === 0) return rest;
    const [first, second] = [0, 1].map((s) =>
      Array.from(
        { length: layout.wedgesPerSide },
        (_, i) => expansion.get(wedgeKey(s, i)) ?? 0,
      ),
    );
    return wedgeGeometry({ ...layout, ...frame, expansion: [first, second] });
  }, [frame, layout, rest, expansion]);

  const cancelHold = () => {
    const timer = hold.current?.timer;
    if (timer != null) window.clearTimeout(timer);
    hold.current = null;
  };

  const startHold = (key: string, event: PointerEvent) => {
    cancelHold();
    const next: Hold = {
      key,
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      timer: null,
    };
    next.timer = window.setTimeout(() => {
      next.timer = null;
      setHeld(key);
    }, holdDelay);
    hold.current = next;
  };

  const moveHold = (event: PointerEvent) => {
    const current = hold.current;
    if (current?.pointerId !== event.pointerId || current.timer === null) {
      return;
    }
    const moved = Math.hypot(event.clientX - current.x, event.clientY - current.y);
    if (moved > holdSlop) cancelHold();
  };

  const endHold = (event: PointerEvent) => {
    if (hold.current?.pointerId !== event.pointerId) return;
    cancelHold();
    setHeld(null);
  };

  const release = (key: string) => (current: string | null) =>
    current === key ? null : current;

  const stack = [...expansion.keys()];

  return (
    <div
      ref={ref}
      className={mergeClasses("relative flex items-center justify-center", className)}
    >
      {frame &&
        geometry?.sides.map(
          (side, s) => side.ring && <Wedge key={s} path={side.ring.path} />,
        )}
      {frame &&
        geometry?.sides.map((side, s) =>
          side.wedges.map((wedge, i) => {
            const key = wedgeKey(s, i);
            const rank = stack.indexOf(key);
            const resting = rest?.sides[s].wedges[i];
            const slot = (rank < 0 && resting ? resting : wedge).slot;
            const node = content?.[s]?.[i];
            return (
              <div
                key={key}
                tabIndex={0}
                className="
                  pointer-events-none absolute inset-0 outline-none select-none
                "
                style={rank < 0 ? undefined : { zIndex: rank + 1 }}
                onPointerEnter={(event) => {
                  if (event.pointerType !== "touch") setHovered(key);
                }}
                onPointerLeave={(event) => {
                  if (event.pointerType !== "touch") setHovered(release(key));
                }}
                onPointerDown={(event) => {
                  if (event.pointerType === "touch") startHold(key, event);
                }}
                onPointerMove={moveHold}
                onPointerUp={endHold}
                onPointerCancel={endHold}
                onContextMenu={(event) => {
                  if (hold.current?.key === key) event.preventDefault();
                }}
                onFocus={(event) => {
                  if (event.target.matches(":focus-visible")) setFocused(key);
                }}
                onBlur={(event) => {
                  const next = event.relatedTarget;
                  if (next instanceof Node && event.currentTarget.contains(next)) {
                    return;
                  }
                  setFocused(release(key));
                }}
              >
                <Wedge
                  path={wedge.path}
                  image={images?.[s]?.[i]}
                  bounds={wedge.bounds}
                  blur={blur}
                  focused={focused === key}
                  className="pointer-events-auto"
                />
                {slot && node != null && (
                  <div
                    className="
                      pointer-events-auto absolute flex items-center
                      justify-center overflow-hidden
                    "
                    style={{
                      left: slot.x,
                      top: slot.y,
                      width: slot.width,
                      height: slot.height,
                    }}
                  >
                    {node}
                  </div>
                )}
              </div>
            );
          }),
        )}
      <div className="relative">{children}</div>
    </div>
  );
}
