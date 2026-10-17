import { useId } from "react";

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

const toggleClasses = `
  state-layer inline-flex size-10 items-center justify-center rounded-full
  text-on-primary-container
`;

export function NavMenu({
  label,
  items,
  wobble,
  component,
  className,
}: {
  label: string;
  items: readonly NavItem[];
  wobble: WedgeWobble;
  component?: NavLinkComponent;
  className?: string;
}) {
  const id = useId();
  return (
    <div className={mergeClasses("flex items-center", className)}>
      <button
        type="button"
        popoverTarget={id}
        aria-label={label}
        className={toggleClasses}
      >
        <MenuIcon />
      </button>
      <div
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
            <div className="flex h-16 shrink-0 items-center px-4">
              <button
                type="button"
                popoverTarget={id}
                popoverTargetAction="hide"
                aria-label={`Close ${label.toLowerCase()}`}
                className={toggleClasses}
              >
                <MenuIcon />
              </button>
            </div>
            <ul className="flex flex-col gap-1 overflow-y-auto px-4 pb-6">
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
