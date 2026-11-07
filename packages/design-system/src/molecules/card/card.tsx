import type { ReactNode } from "react";

import type { WedgeWobble } from "../../organisms/wedges/wedge-geometry";
import { mergeClasses } from "../../utils/merge-classes";
import { WobbleBox } from "../wobble-box";

const tones = {
  lowest: "bg-surface-container-lowest",
  low: "bg-surface-container-low",
  default: "bg-surface-container",
  high: "bg-surface-container-high",
  none: "",
} as const;

export type CardTone = keyof typeof tones;

export function Card({
  wobble,
  lgWobble,
  tone = "low",
  as: Content = "div",
  className,
  contentClassName,
  children,
}: {
  wobble: WedgeWobble;
  lgWobble?: WedgeWobble;
  tone?: CardTone;
  as?: "div" | "section" | "article";
  className?: string;
  contentClassName?: string;
  children: ReactNode;
}) {
  return (
    <WobbleBox wobble={wobble} lgWobble={lgWobble} className={className}>
      <Content
        className={mergeClasses(
          "flex size-full flex-col gap-4 p-6",
          tones[tone],
          contentClassName,
        )}
      >
        {children}
      </Content>
    </WobbleBox>
  );
}
