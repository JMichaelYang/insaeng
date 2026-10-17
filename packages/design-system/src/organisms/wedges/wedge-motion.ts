import { useEffect, useRef, useState, type RefObject } from "react";

import { linear, parseCubicBezier, parseDuration } from "../../utils/easing";
import type { WedgeRect } from "./wedge-geometry";

const reducedMotionQuery = "(prefers-reduced-motion: reduce)";

const mix = (a: number, b: number, t: number) => a + (b - a) * t;

export function blend(from: WedgeRect | null, to: WedgeRect | null, t: number) {
  if (!from || !to || t <= 0) return from;
  return {
    x: mix(from.x, to.x, t),
    y: mix(from.y, to.y, t),
    width: mix(from.width, to.width, t),
    height: mix(from.height, to.height, t),
  };
}

export function readMotion(element: Element) {
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

export function useWedgeExpansion(
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
