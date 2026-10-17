import { useId } from "react";

import {
  NavLink,
  type NavItem,
  type NavLinkComponent,
} from "../atoms/nav-link";
import { WobbleBox } from "../molecules/wobble-box";
import { mergeClasses } from "../utils/merge-classes";
import type { WedgeWobble } from "./wedges/wedge-geometry";

const bottomEdge = { bottom: true };

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
