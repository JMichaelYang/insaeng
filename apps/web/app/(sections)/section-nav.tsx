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
import { lgWobble, wobble } from "../wobble";

const bottomEdge = { bottom: true };
const avatarEdges = { right: true, left: true };

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
    <header className="
      sticky top-0 z-sticky h-16
      lg:h-20
    ">
      <WobbleBox
        wobble={wobble}
        lgWobble={lgWobble}
        edges={bottomEdge}
        className="absolute inset-0"
      >
        <div className="flex size-full justify-center bg-primary-container">
          <ViewTransition
            name={headshotTransition}
            share="morph"
            default="none"
          >
            <WobbleBox
              wobble={wobble}
              lgWobble={lgWobble}
              edges={avatarEdges}
              className="
                size-16
                lg:size-20
              "
            >
              <Avatar
                shape="square"
                blur="xs"
                fade={0}
                className="size-full"
              >
                <Image {...headshot} alt="" sizes={headshotSizes.nav} preload />
              </Avatar>
            </WobbleBox>
          </ViewTransition>
        </div>
      </WobbleBox>
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
            col-start-2 row-start-1 size-16 self-start
            lg:size-20
          "
        />
        <NavLinks
          items={navItems(sections[1], current)}
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
