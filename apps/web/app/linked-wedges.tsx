"use client";

import { Wedges } from "@insaeng/design-system";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ComponentProps } from "react";

export function LinkedWedges(
  props: Omit<ComponentProps<typeof Wedges>, "links">,
) {
  const router = useRouter();
  return (
    <Wedges
      {...props}
      links={{ component: Link, navigate: (href) => router.push(href) }}
    />
  );
}
