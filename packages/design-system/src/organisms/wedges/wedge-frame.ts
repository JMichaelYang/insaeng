import { useLayoutEffect, useState, type RefObject } from "react";

import type { WedgeOrientation } from "./wedge-geometry";

export type WedgeFrame = {
  width: number;
  height: number;
  orientation: WedgeOrientation;
};

const rowQuery = "(min-width: 64rem)";

export function useWedgeFrame(ref: RefObject<HTMLElement | null>) {
  const [frame, setFrame] = useState<WedgeFrame | null>(null);

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
