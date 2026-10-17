import {
  NavLink,
  type NavItem,
  type NavLinkComponent,
} from "../atoms/nav-link";
import { mergeClasses } from "../utils/merge-classes";

export function NavLinks({
  items,
  component,
  className,
}: {
  items: readonly NavItem[];
  component?: NavLinkComponent;
  className?: string;
}) {
  return (
    <ul className={mergeClasses("flex items-center", className)}>
      {items.map((item) => (
        <li key={item.href}>
          <NavLink href={item.href} current={item.current} component={component}>
            {item.label}
          </NavLink>
        </li>
      ))}
    </ul>
  );
}
