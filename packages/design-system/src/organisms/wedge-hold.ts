import { useEffect, useRef, useState, type PointerEvent } from "react";

type Hold = {
  key: string;
  pointerId: number;
  x: number;
  y: number;
  timer: number | null;
};

const holdDelay = 350;
const holdSlop = 10;

export function useWedgeHold() {
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
