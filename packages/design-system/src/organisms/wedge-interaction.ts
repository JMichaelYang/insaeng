import {
  useEffect,
  useRef,
  useState,
  type FocusEvent,
  type MouseEvent,
  type PointerEvent,
  type RefObject,
} from "react";

import type { WedgeGeometry } from "./wedge-geometry";
import { pickWedge } from "./wedge-hit-test";
import { useWedgeHold } from "./wedge-hold";
import { readMotion } from "./wedge-motion";

const release = (key: string) => (current: string | null) =>
  current === key ? null : current;

export function useWedgeInteraction(
  ref: RefObject<HTMLElement | null>,
  navigate?: (href: string) => void,
) {
  const touched = useRef<string | null>(null);
  const transition = useRef<number | null>(null);
  const hold = useWedgeHold();
  const [hovered, setHovered] = useState<string | null>(null);
  const [tapped, setTapped] = useState<string | null>(null);
  const [focused, setFocused] = useState<string | null>(null);

  useEffect(
    () => () => {
      if (transition.current !== null) window.clearTimeout(transition.current);
    },
    [],
  );

  const hover = (
    event: PointerEvent<HTMLElement>,
    rest: WedgeGeometry | null,
    geometry: WedgeGeometry | null,
  ) => {
    if (event.pointerType === "touch" || !rest) return;
    const box = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - box.left;
    const y = event.clientY - box.top;
    setHovered(pickWedge(rest, geometry, hovered, x, y));
  };

  const leave = (event: PointerEvent) => {
    if (event.pointerType !== "touch") setHovered(null);
  };

  const target = (key: string, href?: string) => ({
    onClick: (event: MouseEvent<HTMLElement>) => {
      const tap = touched.current === key;
      touched.current = null;
      if (hold.consumeClick(key)) {
        event.preventDefault();
        return;
      }
      if (!navigate || !href || !tap || !ref.current) return;
      const { duration } = readMotion(ref.current);
      if (duration <= 0) return;
      event.preventDefault();
      if (transition.current !== null) return;
      setTapped(key);
      transition.current = window.setTimeout(() => {
        transition.current = null;
        navigate(href);
      }, duration);
    },
    onPointerDown: (event: PointerEvent<HTMLElement>) => {
      touched.current = event.pointerType === "touch" ? key : null;
      if (event.pointerType === "touch") hold.start(key, event);
    },
    onPointerMove: hold.move,
    onPointerUp: hold.end,
    onPointerCancel: hold.end,
    onContextMenu: (event: MouseEvent<HTMLElement>) => {
      if (hold.holding(key)) event.preventDefault();
    },
    onFocus: (event: FocusEvent<HTMLElement>) => {
      if (event.target.matches(":focus-visible")) setFocused(key);
    },
    onBlur: (event: FocusEvent<HTMLElement>) => {
      const next = event.relatedTarget;
      if (next instanceof Node && event.currentTarget.contains(next)) return;
      setFocused(release(key));
    },
  });

  return {
    active: tapped ?? hold.held ?? hovered ?? focused,
    focused,
    hover,
    leave,
    target,
  };
}
