import {
  Avatar,
  mergeClasses,
  WobbleBox,
  WobbleText,
} from "@insaeng/design-system";
import Image from "next/image";
import Link from "next/link";
import { ViewTransition } from "react";

import { headshot, headshotSizes, headshotTransition } from "../headshot";
import { type Section, sectionHref, sections } from "../sections";
import { lgWobble, titleWobble, wobble } from "../wobble";

const menuId = "section-menu";
const bottomEdge = { bottom: true };

function SectionLink({
  section,
  current,
  className,
}: {
  section: Section;
  current: string;
  className?: string;
}) {
  return (
    <Link
      href={sectionHref(section)}
      aria-current={section.slug === current ? "page" : undefined}
      className={mergeClasses(
        `
          state-layer inline-flex h-control-lg items-center rounded-full px-4
          type-heading-xl whitespace-nowrap text-on-surface
          aria-[current=page]:bg-secondary-container
          aria-[current=page]:text-on-secondary-container
        `,
        className,
      )}
    >
      <WobbleText text={section.title} wobble={titleWobble} />
    </Link>
  );
}

function SectionLinks({
  group,
  current,
  className,
}: {
  group: readonly Section[];
  current: string;
  className: string;
}) {
  return (
    <ul className={className}>
      {group.map((section) => (
        <li key={section.slug}>
          <SectionLink section={section} current={current} />
        </li>
      ))}
    </ul>
  );
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-icon-lg" aria-hidden>
      <path
        d="M4 7h16M4 12h16M4 17h16"
        className="fill-none stroke-current"
        strokeWidth={2}
        strokeLinecap="round"
      />
    </svg>
  );
}

function SectionMenu({ current }: { current: string }) {
  return (
    <div className="
      col-start-1 row-start-1 flex items-center
      lg:hidden
    ">
      <button
        type="button"
        popoverTarget={menuId}
        aria-label="Sections"
        className="
          state-layer inline-flex size-10 items-center justify-center
          rounded-full text-on-surface
        "
      >
        <MenuIcon />
      </button>
      <div
        id={menuId}
        popover="auto"
        className="
          fixed inset-x-0 top-16 bottom-auto m-0 w-full border-0 bg-transparent
          p-0 text-on-surface
        "
      >
        <WobbleBox wobble={wobble} edges={bottomEdge}>
          <ul className="flex flex-col gap-1 bg-surface px-4 pt-2 pb-6">
            {sections.flat().map((section) => (
              <li key={section.slug}>
                <SectionLink
                  section={section}
                  current={current}
                  className="flex"
                />
              </li>
            ))}
          </ul>
        </WobbleBox>
      </div>
    </div>
  );
}

export function SectionNav({ current }: { current: string }) {
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
        <div className="size-full bg-surface" />
      </WobbleBox>
      <nav
        aria-label="Sections"
        className="
          relative grid h-full grid-cols-[1fr_auto_1fr] items-center gap-4 px-4
          lg:px-8
        "
      >
        <SectionMenu current={current} />
        <SectionLinks
          group={sections[0]}
          current={current}
          className="
            col-start-1 row-start-1 hidden items-center justify-evenly
            lg:flex
          "
        />
        <Link
          href="/"
          aria-label="Home"
          className="col-start-2 row-start-1 mt-2 self-start"
        >
          <ViewTransition
            name={headshotTransition}
            share="morph"
            default="none"
          >
            <WobbleBox
              wobble={wobble}
              lgWobble={lgWobble}
              className="
                size-20
                lg:size-24
              "
            >
              <Avatar shape="square" className="size-full">
                <Image {...headshot} alt="" sizes={headshotSizes.nav} preload />
              </Avatar>
            </WobbleBox>
          </ViewTransition>
        </Link>
        <SectionLinks
          group={sections[1]}
          current={current}
          className="
            col-start-3 row-start-1 hidden items-center justify-evenly
            lg:flex
          "
        />
      </nav>
    </header>
  );
}
