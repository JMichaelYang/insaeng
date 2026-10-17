import type { ReactNode } from "react";

import { headshotSizes, preloadHeadshot } from "../headshot";
import { SectionNav } from "./section-nav";

export default function SectionsLayout({ children }: { children: ReactNode }) {
  preloadHeadshot(headshotSizes.home);
  return (
    <>
      <SectionNav />
      {children}
    </>
  );
}
