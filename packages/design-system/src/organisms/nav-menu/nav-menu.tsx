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

const bottomEdge = { bottom: true };

export function NavMenu({
  label,
  items,
  wobble,
  component,
  className,
  panelClassName,
}: {
  label: string;
  items: readonly NavItem[];
  wobble: WedgeWobble;
  component?: NavLinkComponent;
  className?: string;
  panelClassName?: string;
}) {
  const id = useId();
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
        id={id}
        popover="auto"
        className={mergeClasses(
          `
            fixed inset-x-0 bottom-auto m-0 w-full border-0 bg-transparent p-0
            text-on-primary-container
          `,
          panelClassName,
        )}
      >
        <WobbleBox wobble={wobble} edges={bottomEdge}>
          <ul className="
            flex flex-col gap-1 bg-primary-container px-4 pt-2 pb-6
          ">
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
        </WobbleBox>
      </div>
    </div>
  );
}
