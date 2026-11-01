import type { ReactNode } from "react";

import { NavLink, type NavLinkComponent } from "../../atoms/nav-link";
import type { WedgeWobble } from "../../organisms/wedges/wedge-geometry";
import { mergeClasses } from "../../utils/merge-classes";
import { WobbleBox } from "../wobble-box";

export function WobbleNavLink({
  href,
  current = false,
  wobble,
  lgWobble = wobble,
  component,
  className,
  children,
}: {
  href: string;
  current?: boolean;
  wobble: WedgeWobble;
  lgWobble?: WedgeWobble;
  component?: NavLinkComponent;
  className?: string;
  children: ReactNode;
}) {
  return (
    <WobbleBox
      wobble={wobble}
      lgWobble={lgWobble}
      shape="pill"
      clip="state-layer"
      outlined={current}
      lineClassName="stroke-current"
      className={mergeClasses("-translate-y-0.5", className)}
    >
      <NavLink
        href={href}
        current={current}
        component={component}
        className="flex"
      >
        {children}
      </NavLink>
    </WobbleBox>
  );
}
