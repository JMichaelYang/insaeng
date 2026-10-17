"use client";

import { useEffect, useId, useRef } from "react";

import { MenuIcon } from "../../atoms/menu-icon";
import {
  NavLink,
  type NavItem,
  type NavLinkComponent,
} from "../../atoms/nav-link";
import { WobbleBox } from "../../molecules/wobble-box";
import { parseDuration } from "../../utils/easing";
import { mergeClasses } from "../../utils/merge-classes";
import type { WedgeWobble } from "../wedges/wedge-geometry";

const rightEdge = { right: true };

function exitDuration(element: Element) {
  const style = getComputedStyle(element);
  if (style.transitionProperty === "none") return 0;
  return parseDuration(style.transitionDuration.split(",")[0]) ?? 0;
}

export function NavMenu({
  label,
  items,
  wobble,
  component,
  navigate,
  className,
}: {
  label: string;
  items: readonly NavItem[];
  wobble: WedgeWobble;
  component?: NavLinkComponent;
  navigate?: (href: string) => void;
  className?: string;
}) {
  const id = useId();
  const panel = useRef<HTMLDivElement>(null);
  const exit = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (exit.current !== null) window.clearTimeout(exit.current);
    },
    [],
  );
  return (
    <div className={mergeClasses("flex items-center", className)}>
      <button
        type="button"
        popoverTarget={id}
        aria-label={label}
        className="
          state-layer inline-flex size-10 items-center justify-center
          rounded-full text-on-primary-container
        "
      >
        <MenuIcon />
      </button>
      <div
        ref={panel}
        id={id}
        popover="auto"
        className="
          fixed inset-y-0 left-0 m-0 h-full max-h-none w-2xs -translate-x-full
          overflow-visible border-0 bg-transparent p-0 text-on-primary-container
          transition-[translate,display,overlay] transition-discrete
          duration-normal ease-standard
          backdrop:bg-scrim/32 backdrop:opacity-0
          backdrop:transition-[opacity,display,overlay]
          backdrop:transition-discrete backdrop:duration-normal
          backdrop:ease-standard
          open:translate-x-0
          open:backdrop:opacity-100
          motion-reduce:transition-none
          motion-reduce:backdrop:transition-none
          starting:open:-translate-x-full
          starting:open:backdrop:opacity-0
        "
      >
        <WobbleBox wobble={wobble} edges={rightEdge} className="h-full">
          <div className="flex h-full flex-col bg-primary-container">
            <ul
              className="flex flex-col gap-1 overflow-y-auto px-4 py-6"
              onClickCapture={(event) => {
                const element = panel.current;
                if (
                  !navigate ||
                  !element ||
                  event.button !== 0 ||
                  event.metaKey ||
                  event.ctrlKey ||
                  event.shiftKey ||
                  event.altKey
                ) {
                  return;
                }
                const link =
                  event.target instanceof Element
                    ? event.target.closest("a[href]")
                    : null;
                const href = link?.getAttribute("href");
                if (!href) return;
                event.preventDefault();
                if (exit.current !== null) return;
                const duration = exitDuration(element);
                element.hidePopover();
                if (duration <= 0) {
                  navigate(href);
                  return;
                }
                exit.current = window.setTimeout(() => {
                  exit.current = null;
                  navigate(href);
                }, duration);
              }}
            >
              {items.map((item) => (
                <li key={item.href}>
                  <NavLink
                    href={item.href}
                    current={item.current}
                    component={component}
                    className="flex"
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        </WobbleBox>
      </div>
    </div>
  );
}
