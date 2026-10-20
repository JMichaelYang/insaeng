import type { ComponentProps } from "react";

import { mergeClasses } from "../../utils/merge-classes";
import { Fade } from "../fade";

export function Avatar({
  shape = "circle",
  fade,
  className,
  children,
  ...props
}: ComponentProps<"span"> & {
  shape?: "circle" | "square";
  fade?: number;
}) {
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
      {children}
      {fade !== undefined && <Fade radius={fade} />}
    </span>
  );
}
