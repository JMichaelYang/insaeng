import type { ComponentProps } from "react";

import { mergeClasses } from "../../utils/merge-classes";

const tones = {
  primary: "bg-primary text-on-primary",
  tertiary: "bg-tertiary text-on-tertiary",
} as const;

export type ButtonTone = keyof typeof tones;

export function Button({
  tone = "primary",
  type = "button",
  className,
  ...props
}: { tone?: ButtonTone } & ComponentProps<"button">) {
  return (
    <button
      type={type}
      className={mergeClasses(
        `
          state-layer inline-flex h-control-md items-center justify-center
          rounded-full px-6 type-label
        `,
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
