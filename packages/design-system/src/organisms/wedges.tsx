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
  type WedgeGeometry,
  type WedgeGeometryOptions,
  type WedgeOrientation,
  type WedgeRect,
} from "./wedge-geometry";
import type { ImageBlur, ImageSource } from "../atoms/image";
import { Wedge, WedgeLines } from "../molecules/wedge";

export type WedgesLayout = Omit<
  WedgeGeometryOptions,
  "width" | "height" | "orientation" | "expansion" | "wedgesPerSide"
>;

export type WedgeItem = {
  content?: ReactNode;
  image?: ImageSource;
  href?: string;
};

export type WedgesSides = readonly [readonly WedgeItem[], readonly WedgeItem[]];

type WedgeTargetProps = HTMLAttributes<HTMLElement> & { href?: string };

export type WedgesLinks = {
  component: ElementType<WedgeTargetProps & { href: string }>;
  navigate: (href: string) => void;
};

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
const hoverSlop = 8;

const wedgeKey = (side: number, index: number) => `${side}-${index}`;

const mix = (a: number, b: number, t: number) => a + (b - a) * t;

let hitContext: CanvasRenderingContext2D | null | undefined;

function contains(path: string | undefined, x: number, y: number, slop = 0) {
  if (!path) return false;
  hitContext ??= document.createElement("canvas").getContext("2d");
  if (!hitContext) return false;
  const shape = new Path2D(path);
  if (hitContext.isPointInPath(shape, x, y)) return true;
  if (slop <= 0) return false;
  hitContext.lineWidth = slop * 2;
  return hitContext.isPointInStroke(shape, x, y);
}

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

function pick(
  rest: WedgeGeometry,
  geometry: WedgeGeometry | null,
  hovered: string | null,
  x: number,
  y: number,
) {
  const wedges = rest.sides.flatMap((side, s) =>
    side.wedges.map((wedge, i) => ({
      key: wedgeKey(s, i),
      resting: wedge.path,
      current: geometry?.sides[s].wedges[i]?.path,
    })),
  );
  const inside = wedges.find(({ resting }) => contains(resting, x, y));
  const slop = inside ? hoverSlop : 0;
  const kept = wedges.find(
    ({ key, resting, current }) =>
      key === hovered &&
      (contains(current, x, y) || contains(resting, x, y, slop)),
  );
  return (kept ?? inside)?.key ?? null;
}

function useFrame(ref: RefObject<HTMLElement | null>) {
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
  }, [ref]);

  return frame;
}

function useHold() {
  const hold = useRef<Hold | null>(null);
  const heldClick = useRef<string | null>(null);
  const [held, setHeld] = useState<string | null>(null);

  useEffect(
    () => () => {
      const timer = hold.current?.timer;
      if (timer != null) window.clearTimeout(timer);
    },
    [],
  );

  const cancel = () => {
    const timer = hold.current?.timer;
    if (timer != null) window.clearTimeout(timer);
    hold.current = null;
  };

  const start = (key: string, event: PointerEvent) => {
    cancel();
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

  const move = (event: PointerEvent) => {
    const current = hold.current;
    if (current?.pointerId !== event.pointerId || current.timer === null) {
      return;
    }
    const moved = Math.hypot(event.clientX - current.x, event.clientY - current.y);
    if (moved > holdSlop) cancel();
  };

  const end = (event: PointerEvent) => {
    if (hold.current?.pointerId !== event.pointerId) return;
    cancel();
    setHeld(null);
  };

  const consumeClick = (key: string) => {
    if (heldClick.current !== key) return false;
    heldClick.current = null;
    return true;
  };

  const holding = (key: string) => hold.current?.key === key;

  return { held, start, move, end, consumeClick, holding };
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
  sides,
  links,
  blur,
  tilt = false,
  className,
  children,
}: {
  row: WedgesLayout;
  column: WedgesLayout;
  sides: WedgesSides;
  links?: WedgesLinks;
  blur?: ImageBlur;
  tilt?: boolean;
  className?: string;
  children?: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const touched = useRef<string | null>(null);
  const transition = useRef<number | null>(null);
  const frame = useFrame(ref);
  const hold = useHold();
  const [hovered, setHovered] = useState<string | null>(null);
  const [tapped, setTapped] = useState<string | null>(null);
  const [focused, setFocused] = useState<string | null>(null);
  const expansion = useExpansion(tapped ?? hold.held ?? hovered ?? focused, ref);

  useEffect(
    () => () => {
      if (transition.current !== null) window.clearTimeout(transition.current);
    },
    [],
  );

  const layout = frame?.orientation === "row" ? row : column;
  const wedgesPerSide = Math.max(sides[0].length, sides[1].length);

  const rest = useMemo(() => {
    if (!frame || frame.width <= 0 || frame.height <= 0) return null;
    return wedgeGeometry({ ...layout, ...frame, wedgesPerSide });
  }, [frame, layout, wedgesPerSide]);

  const geometry = useMemo(() => {
    if (!frame || !rest || expansion.size === 0) return rest;
    const [first, second] = [0, 1].map((s) =>
      Array.from(
        { length: wedgesPerSide },
        (_, i) => expansion.get(wedgeKey(s, i)) ?? 0,
      ),
    );
    return wedgeGeometry({
      ...layout,
      ...frame,
      wedgesPerSide,
      expansion: [first, second],
    });
  }, [frame, layout, wedgesPerSide, rest, expansion]);

  const release = (key: string) => (current: string | null) =>
    current === key ? null : current;

  const hoverAt = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "touch" || !rest) return;
    const box = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - box.left;
    const y = event.clientY - box.top;
    setHovered(pick(rest, geometry, hovered, x, y));
  };

  const stack = [...expansion.keys()];
  const center = frame ? rest?.center : null;

  return (
    <div
      ref={ref}
      className={mergeClasses("relative flex items-center justify-center", className)}
      onPointerMove={hoverAt}
      onPointerLeave={(event) => {
        if (event.pointerType !== "touch") setHovered(null);
      }}
    >
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
            const item: WedgeItem = sides[s][i] ?? {};
            const { content: node, image, href } = item;
            const Element = (
              links && href ? links.component : "div"
            ) as ElementType<WedgeTargetProps>;
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
                  if (hold.consumeClick(key)) {
                    event.preventDefault();
                    return;
                  }
                  if (!links || !href || !tap || !ref.current) return;
                  const { duration } = readMotion(ref.current);
                  if (duration <= 0) return;
                  event.preventDefault();
                  if (transition.current !== null) return;
                  setTapped(key);
                  transition.current = window.setTimeout(() => {
                    transition.current = null;
                    links.navigate(href);
                  }, duration);
                }}
                onPointerDown={(event) => {
                  touched.current = event.pointerType === "touch" ? key : null;
                  if (event.pointerType === "touch") hold.start(key, event);
                }}
                onPointerMove={hold.move}
                onPointerUp={hold.end}
                onPointerCancel={hold.end}
                onContextMenu={(event) => {
                  if (hold.holding(key)) event.preventDefault();
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
                  image={image}
                  bounds={wedge.bounds}
                  blur={blur}
                  fade={geometry.cutRadius}
                  focused={focused === key}
                  className="pointer-events-auto"
                />
                {slot && node != null && (
                  <div
                    className="
                      absolute flex items-center justify-center overflow-hidden
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
