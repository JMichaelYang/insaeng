import type { NavItem, NavLinkComponent } from "../../atoms/nav-link";
import type { WedgeWobble } from "../../organisms/wedges/wedge-geometry";
import { mergeClasses } from "../../utils/merge-classes";
import { WobbleNavLink } from "../wobble-nav-link";

export function NavLinks({
  items,
  wobble,
  lgWobble = wobble,
  component,
  className,
}: {
  items: readonly NavItem[];
  wobble: WedgeWobble;
  lgWobble?: WedgeWobble;
  component?: NavLinkComponent;
  className?: string;
}) {
  return (
    <ul className={mergeClasses("flex items-center", className)}>
      {items.map((item) => (
        <li key={item.href}>
          <WobbleNavLink
            href={item.href}
            current={item.current}
            wobble={wobble}
            lgWobble={lgWobble}
            component={component}
          >
            {item.label}
          </WobbleNavLink>
        </li>
      ))}
    </ul>
  );
}
