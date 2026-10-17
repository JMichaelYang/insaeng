import { type ReactNode, ViewTransition } from "react";

export default function SectionsTemplate({ children }: { children: ReactNode }) {
  return (
    <ViewTransition enter="fade" exit="fade" default="none">
      {children}
    </ViewTransition>
  );
}
