"use client";

import {
  Avatar,
  type NavItem,
  NavLinks,
  NavMenu,
  WobbleBox,
} from "@insaeng/design-system";
import Image from "next/image";
import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";
import { ViewTransition } from "react";

import { headshot, headshotSizes, headshotTransition } from "../headshot";
import { type Section, sectionHref, sections } from "../sections";
import { avatarWobble, lgAvatarWobble, wobble } from "../wobble";

const navTransition = "section-nav";

function navItems(
  group: readonly Section[],
  current: string | null,
): NavItem[] {
  return group.map((section) => ({
    href: sectionHref(section),
    label: section.title,
    current: section.slug === current,
  }));
}

export function SectionNav() {
  const current = useSelectedLayoutSegment();
  return (
    <header
      className="
        sticky top-0 z-sticky h-16 text-on-surface
        lg:h-20
      "
      style={{ viewTransitionName: navTransition }}
    >
      <div className="absolute inset-0 flex justify-center">
        <ViewTransition name={headshotTransition} share="morph" default="none">
          <WobbleBox
            wobble={avatarWobble}
            lgWobble={lgAvatarWobble}
            shape="circle"
            className="
              mt-2 size-12
              lg:size-16
            "
          >
            <Avatar className="size-full">
              <Image {...headshot} alt="" sizes={headshotSizes.nav} preload />
            </Avatar>
          </WobbleBox>
        </ViewTransition>
      </div>
      <nav
        aria-label="Sections"
        className="
          relative grid h-full grid-cols-[1fr_auto_1fr] grid-rows-1 items-center
          gap-4 px-4
          lg:px-8
        "
      >
        <NavMenu
          label="Sections"
          groups={sections.map((group) => navItems(group, current))}
          wobble={wobble}
          component={Link}
          className="
            col-start-1 row-start-1
            lg:hidden
          "
        />
        <NavLinks
          items={navItems(sections[0], current)}
          wobble={avatarWobble}
          lgWobble={lgAvatarWobble}
          component={Link}
          className="
            col-start-1 row-start-1 hidden justify-evenly
            lg:flex
          "
        />
        <Link
          href="/"
          aria-label="Home"
          className="
            col-start-2 row-start-1 mt-2 size-12 self-start
            lg:size-16
          "
        />
        <NavLinks
          items={navItems(sections[1], current)}
          wobble={avatarWobble}
          lgWobble={lgAvatarWobble}
          component={Link}
          className="
            col-start-3 row-start-1 hidden justify-evenly
            lg:flex
          "
        />
      </nav>
    </header>
  );
}
