import type { ComponentProps } from "react";

export type ImageSource =
  | { mode: "svg"; src: string }
  | { mode: "raster"; src: string; srcSet?: string; sizes?: string };

export function Image({
  source,
  alt,
  ...props
}: { source: ImageSource; alt: string } & Omit<
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
      {...props}
    />
  );
}
