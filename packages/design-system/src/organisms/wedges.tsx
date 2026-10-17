"use client";

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ElementType,
  type HTMLAttributes,
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
  type WedgeRect,
} from "../utils/wedge-geometry";
import type { ImageBlur, ImageSource } from "../atoms/image";
import { Wedge, WedgeLines } from "../molecules/wedge";

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

export type WedgesLinks = readonly [readonly string[], readonly string[]];

type WedgeTargetProps = HTMLAttributes<HTMLElement> & { href?: string };

export type WedgesLinkComponent = ElementType<
  WedgeTargetProps & { href: string }
>;

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

const mix = (a: number, b: number, t: number) => a + (b - a) * t;

function blend(from: WedgeRect | null, to: WedgeRect | null, t: number) {
  if (!from || !to || t <= 0) return from;
  return {
    x: mix(from.x, to.x, t),
    y: mix(from.y, to.y, t),
    width: mix(from.width, to.width, t),
    height: mix(from.height, to.height, t),
  };
}

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
  links,
  linkAs = "a",
  blur,
  tilt = false,
  className,
  children,
}: {
  row: WedgesLayout;
  column: WedgesLayout;
  content?: WedgesContent;
  images?: WedgesImages;
  links?: WedgesLinks;
  linkAs?: WedgesLinkComponent;
  blur?: ImageBlur;
  tilt?: boolean;
  className?: string;
  children?: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const hold = useRef<Hold | null>(null);
  const heldClick = useRef<string | null>(null);
  const touched = useRef<string | null>(null);
  const navigating = useRef<string | null>(null);
  const transition = useRef<number | null>(null);
  const [frame, setFrame] = useState<Frame | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [held, setHeld] = useState<string | null>(null);
  const [tapped, setTapped] = useState<string | null>(null);
  const [focused, setFocused] = useState<string | null>(null);
  const expansion = useExpansion(tapped ?? held ?? hovered ?? focused, ref);

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
      if (transition.current !== null) window.clearTimeout(transition.current);
    },
    [],
  );

  useEffect(() => {
    const reset = (event: PageTransitionEvent) => {
      if (!event.persisted) return;
      if (transition.current !== null) window.clearTimeout(transition.current);
      transition.current = null;
      setTapped(null);
    };
    window.addEventListener("pageshow", reset);
    return () => window.removeEventListener("pageshow", reset);
  }, []);

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
    heldClick.current = null;
    const next: Hold = {
      key,
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      timer: null,
    };
    next.timer = window.setTimeout(() => {
      next.timer = null;
      heldClick.current = key;
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
  const center = frame ? rest?.center : null;

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
            const resting = rest?.sides[s].wedges[i] ?? wedge;
            const e = expansion.get(key) ?? 0;
            const slot = blend(
              resting.slot,
              rest?.sides[s].expandedSlot ?? null,
              e,
            );
            const angle = resting.tilt * (1 - e);
            const node = content?.[s]?.[i];
            const href = links?.[s]?.[i];
            const Element = (href ? linkAs : "div") as ElementType<WedgeTargetProps>;
            return (
              <Element
                key={key}
                href={href}
                tabIndex={href ? undefined : 0}
                draggable={href ? false : undefined}
                className="
                  pointer-events-none absolute inset-0 outline-none select-none
                "
                style={{
                  WebkitTouchCallout: "none",
                  zIndex: rank < 0 ? undefined : rank + 1,
                }}
                onClick={(event) => {
                  const tap = touched.current === key;
                  touched.current = null;
                  if (heldClick.current === key) {
                    heldClick.current = null;
                    event.preventDefault();
                    return;
                  }
                  if (navigating.current === key) {
                    navigating.current = null;
                    return;
                  }
                  if (!href || !tap || !ref.current) return;
                  const { duration } = readMotion(ref.current);
                  if (duration <= 0) return;
                  event.preventDefault();
                  if (transition.current !== null) return;
                  const target = event.currentTarget;
                  setTapped(key);
                  transition.current = window.setTimeout(() => {
                    transition.current = null;
                    navigating.current = key;
                    target.click();
                  }, duration);
                }}
                onPointerEnter={(event) => {
                  if (event.pointerType !== "touch") setHovered(key);
                }}
                onPointerLeave={(event) => {
                  if (event.pointerType !== "touch") setHovered(release(key));
                }}
                onPointerDown={(event) => {
                  touched.current = event.pointerType === "touch" ? key : null;
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
                  lines={wedge.lines}
                  image={images?.[s]?.[i]}
                  bounds={wedge.bounds}
                  blur={blur}
                  fade={geometry.cutRadius}
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
                    {tilt ? (
                      <div style={{ rotate: `${angle}deg` }}>
                        {node}
                      </div>
                    ) : (
                      node
                    )}
                  </div>
                )}
              </Element>
            );
          }),
        )}
      <div
        className="
          pointer-events-none absolute inset-0 flex items-center justify-center
        "
        style={center ? { clipPath: `path("${center.path}")` } : undefined}
      >
        <div className="pointer-events-auto">{children}</div>
      </div>
      {center && <WedgeLines path={center.path} lines={center.lines} />}
    </div>
  );
}
