import type { ComponentProps } from "react";

import { cn } from "../lib/cn";

export function Avatar({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      className={cn(
        `
          block shrink-0 overflow-hidden rounded-full border border-outline
          bg-surface-container
          *:size-full *:object-cover
        `,
        className,
      )}
      {...props}
    />
  );
}
