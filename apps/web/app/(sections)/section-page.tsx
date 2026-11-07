import { mergeClasses } from "@insaeng/design-system";
import type { ReactNode } from "react";

import type { SectionSlug } from "../sections";
import { SectionBackdrop } from "./section-backdrop";

export function SectionPage({
  slug,
  className,
  children,
}: {
  slug: SectionSlug;
  className?: string;
  children: ReactNode;
}) {
  return (
    <main className="
      relative -mt-16 flex flex-1 flex-col
      lg:-mt-20
    ">
      <SectionBackdrop slug={slug} />
      <div
        className={mergeClasses(
          `
            relative mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 pt-24
            pb-16
            lg:gap-16 lg:px-8 lg:pt-32 lg:pb-24
          `,
          className,
        )}
      >
        {children}
      </div>
    </main>
  );
}
