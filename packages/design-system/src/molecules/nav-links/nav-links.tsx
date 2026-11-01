import {
  NavLink,
  type NavItem,
  type NavLinkComponent,
} from "../../atoms/nav-link";
import type { WedgeWobble } from "../../organisms/wedges/wedge-geometry";
import { mergeClasses } from "../../utils/merge-classes";
import { WobbleBox } from "../wobble-box";

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
      {items.map((item) => {
        const link = (
          <NavLink
            href={item.href}
            current={item.current}
            component={component}
            className={
              item.current
                ? `
                  flex translate-y-0
                  aria-[current=page]:border-transparent
                `
                : "flex"
            }
          >
            {item.label}
          </NavLink>
        );
        return (
          <li key={item.href}>
            {item.current ? (
              <WobbleBox
                wobble={wobble}
                lgWobble={lgWobble}
                shape="pill"
                lineClassName="stroke-current"
                className="-translate-y-0.5"
              >
                {link}
              </WobbleBox>
            ) : (
              link
            )}
          </li>
        );
      })}
    </ul>
  );
}
