import type { ComponentProps } from "react";

import type { themeNames } from "../generated/theme-names";
import { mergeClasses } from "../utils/merge-classes";

export type ImageSource =
  | { mode: "svg"; src: string }
  | { mode: "raster"; src: string; srcSet?: string; sizes?: string };

export type ImageBlur = (typeof themeNames.blur)[number];

const blurClasses: Record<ImageBlur, string> = {
  sm: "blur-sm",
  md: "blur-md",
  lg: "blur-lg",
  xl: "blur-xl",
  "2xl": "blur-2xl",
};

export function Image({
  source,
  alt,
  blur,
  className,
  ...props
}: { source: ImageSource; alt: string; blur?: ImageBlur } & Omit<
  ComponentProps<"img">,
  "src" | "srcSet" | "sizes" | "alt"
>) {
  const raster = source.mode === "raster" ? source : undefined;
  return (
    <img
      src={source.src}
      srcSet={raster?.srcSet}
      sizes={raster?.sizes}
      alt={alt}
      decoding="async"
      className={mergeClasses(blur && blurClasses[blur], className)}
      {...props}
    />
  );
}
