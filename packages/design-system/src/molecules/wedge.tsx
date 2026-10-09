import { useId } from "react";

import { Image, type ImageBlur, type ImageSource } from "../atoms/image";
import { mergeClasses } from "../utils/merge-classes";
import type { WedgeRect } from "../utils/wedge-geometry";

const strokeWidth = 2;

export function Wedge({
  path,
  image,
  bounds,
  blur,
  focused = false,
  className,
}: {
  path: string;
  image?: ImageSource;
  bounds?: WedgeRect;
  blur?: ImageBlur;
  focused?: boolean;
  className?: string;
}) {
  const id = useId();
  const bleed = blur ? `var(--blur-${blur}) * 3` : "0px";
  return (
    <>
      <div
        className={mergeClasses(
          "absolute inset-0 overflow-hidden bg-surface-container-lowest",
          className,
        )}
        style={{ clipPath: `path("${path}")` }}
      >
        {image && bounds && (
          <Image
            source={image}
            blur={blur}
            alt=""
            draggable={false}
            className="absolute max-w-none object-cover"
            style={{
              left: `calc(${bounds.x}px - ${bleed})`,
              top: `calc(${bounds.y}px - ${bleed})`,
              width: `calc(${bounds.width}px + ${bleed} * 2)`,
              height: `calc(${bounds.height}px + ${bleed} * 2)`,
            }}
          />
        )}
      </div>
      <svg
        className="pointer-events-none absolute inset-0 size-full"
        aria-hidden
      >
        <clipPath id={id}>
          <path d={path} />
        </clipPath>
        <path
          className={mergeClasses(
            "fill-none",
            focused ? "stroke-secondary" : "stroke-outline",
          )}
          d={path}
          strokeWidth={strokeWidth * 2}
          clipPath={`url(#${id})`}
        />
      </svg>
    </>
  );
}
