import { getImageProps } from "next/image";
import { preload } from "react-dom";

export const headshot = {
  src: "/headshot.jpg",
  width: 720,
  height: 720,
} as const;

export const headshotSizes = {
  home: "(min-width: 64rem) 25rem, 11.5rem",
} as const;

export const headshotTransition = "headshot";

export function preloadHeadshot(sizes: string) {
  const { props } = getImageProps({ ...headshot, alt: "", sizes });
  preload(props.src, {
    as: "image",
    imageSrcSet: props.srcSet,
    imageSizes: props.sizes,
    fetchPriority: "low",
  });
}
