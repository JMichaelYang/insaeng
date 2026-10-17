import type { ComponentProps } from "react";

import { mergeClasses } from "../../utils/merge-classes";

export function Avatar({
  shape = "circle",
  className,
  ...props
}: ComponentProps<"span"> & { shape?: "circle" | "square" }) {
  return (
    <span
      className={mergeClasses(
        `
          block shrink-0 overflow-hidden bg-surface-container
          *:size-full *:object-cover
        `,
        shape === "circle" && "rounded-full",
        className,
      )}
      {...props}
    />
  );
}
