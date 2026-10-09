import type { ComponentProps } from "react";

import { mergeClasses } from "../utils/merge-classes";

export type ImageSource =
  | { mode: "svg"; src: string }
  | { mode: "raster"; src: string; srcSet?: string; sizes?: string };

export function CoverImage({
  source,
  className,
  ...props
}: { source: ImageSource } & Omit<ComponentProps<"div">, "children">) {
  const raster = source.mode === "raster" ? source : undefined;
  return (
    <div
      className={mergeClasses("relative overflow-hidden", className)}
      {...props}
    >
      <img
        src={source.src}
        srcSet={raster?.srcSet}
        sizes={raster?.sizes}
        alt=""
        decoding="async"
        draggable={false}
        className="absolute inset-0 size-full max-w-none object-cover"
      />
    </div>
  );
}
