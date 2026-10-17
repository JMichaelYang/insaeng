import { useLayoutEffect, useState, type RefObject } from "react";

export type Frame = { width: number; height: number; lg: boolean };

const lgQuery = "(min-width: 64rem)";

export function useFrame(ref: RefObject<Element | null>) {
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
  }, [ref]);

  return frame;
}
