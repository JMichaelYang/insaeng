import { useId } from "react";

import { CoverImage, type ImageSource } from "../atoms/cover-image";
import { mergeClasses } from "../utils/merge-classes";
import type { WedgeRect } from "../utils/wedge-geometry";

const strokeWidth = 2;

export function Wedge({
  path,
  image,
  bounds,
  focused = false,
  className,
}: {
  path: string;
  image?: ImageSource;
  bounds?: WedgeRect;
  focused?: boolean;
  className?: string;
}) {
  const id = useId();
  return (
    <>
      <div
        className={mergeClasses(
          "absolute inset-0 bg-surface-container-lowest",
          className,
        )}
        style={{ clipPath: `path("${path}")` }}
      >
        {image && bounds && (
          <CoverImage
            source={image}
            className="absolute"
            style={{
              left: bounds.x,
              top: bounds.y,
              width: bounds.width,
              height: bounds.height,
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
