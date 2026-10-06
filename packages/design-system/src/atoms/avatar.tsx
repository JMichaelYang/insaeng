import type { ComponentProps } from "react";

import { mergeClasses } from "../utils/merge-classes";

export function Avatar({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      className={mergeClasses(
        `
          block shrink-0 overflow-hidden rounded-full border-2 border-outline
          bg-surface-container
          *:size-full *:object-cover
        `,
        className,
      )}
      {...props}
    />
  );
}
