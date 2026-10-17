"use client";

import { Wedges, type WedgesLinks } from "@insaeng/design-system";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ComponentProps } from "react";

export function LinkedWedges({
  hrefs,
  ...props
}: Omit<ComponentProps<typeof Wedges>, "links"> & {
  hrefs: WedgesLinks["hrefs"];
}) {
  const router = useRouter();
  return (
    <Wedges
      {...props}
      links={{ hrefs, component: Link, navigate: (href) => router.push(href) }}
    />
  );
}
