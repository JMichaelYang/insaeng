import type { ComponentProps } from "react";

import { mergeClasses } from "../../utils/merge-classes";
import { Fade } from "../fade";
import { blurClasses, type ImageBlur } from "../image/image";

export function Avatar({
  shape = "circle",
  blur,
  fade,
  className,
  children,
  ...props
}: ComponentProps<"span"> & {
  shape?: "circle" | "square";
  blur?: ImageBlur;
  fade?: number;
}) {
  const bleed = blur && `var(--blur-${blur}) * 3`;
  return (
    <span
      className={mergeClasses(
        `
          relative block shrink-0 overflow-hidden bg-surface-container
          *:size-full *:object-cover
        `,
        shape === "circle" && "rounded-full",
        className,
      )}
      {...props}
    >
      {blur ? (
        <span
          className={mergeClasses(
            `
              absolute
              *:size-full *:object-cover
            `,
            blurClasses[blur],
          )}
          style={{
            left: `calc(-1 * ${bleed})`,
            top: `calc(-1 * ${bleed})`,
            width: `calc(100% + ${bleed} * 2)`,
            height: `calc(100% + ${bleed} * 2)`,
          }}
        >
          {children}
        </span>
      ) : (
        children
      )}
      {fade !== undefined && <Fade radius={fade} />}
    </span>
  );
}
