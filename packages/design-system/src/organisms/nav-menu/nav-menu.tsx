"use client";

import { Fragment, useId, useRef } from "react";

import { MenuIcon } from "../../atoms/menu-icon";
import {
  NavLink,
  type NavItem,
  type NavLinkComponent,
} from "../../atoms/nav-link";
import { WobbleBox } from "../../molecules/wobble-box";
import { mergeClasses } from "../../utils/merge-classes";
import type { WedgeWobble } from "../wedges/wedge-geometry";

const rightEdge = { right: true };
const topEdge = { top: true };

export function NavMenu({
  label,
  groups,
  wobble,
  component,
  className,
}: {
  label: string;
  groups: readonly (readonly NavItem[])[];
  wobble: WedgeWobble;
  component?: NavLinkComponent;
  className?: string;
}) {
  const id = useId();
  const panel = useRef<HTMLDivElement>(null);
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
            <div
              className="flex flex-col gap-1 overflow-y-auto px-4 py-6"
              onClick={(event) => {
                if (
                  event.target instanceof Element &&
                  event.target.closest("a[href]")
                ) {
                  panel.current?.hidePopover();
                }
              }}
            >
              {groups.map((group, index) => (
                <Fragment key={group[0]?.href ?? index}>
                  {index > 0 && (
                    <WobbleBox
                      role="separator"
                      wobble={wobble}
                      edges={topEdge}
                      lineClassName="stroke-tertiary"
                      className="my-2 h-1"
                    />
                  )}
                  <ul className="flex flex-col gap-1">
                    {group.map((item) => (
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
                </Fragment>
              ))}
            </div>
          </div>
        </WobbleBox>
      </div>
    </div>
  );
}
