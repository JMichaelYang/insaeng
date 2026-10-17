import type { ReactNode } from "react";

import { SectionNav } from "./section-nav";

export default function SectionsLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SectionNav />
      {children}
    </>
  );
}
