"use client";

import { NavMenu } from "@insaeng/design-system";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ComponentProps } from "react";

export function LinkedNavMenu(
  props: Omit<ComponentProps<typeof NavMenu>, "component" | "navigate">,
) {
  const router = useRouter();
  return (
    <NavMenu
      {...props}
      component={Link}
      navigate={(href) => router.push(href)}
    />
  );
}
