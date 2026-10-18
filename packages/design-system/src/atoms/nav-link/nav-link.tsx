import type { AnchorHTMLAttributes, ElementType, ReactNode } from "react";

import { mergeClasses } from "../../utils/merge-classes";

export type NavLinkComponent = ElementType<
  AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }
>;

export type NavItem = { href: string; label: string; current?: boolean };

export function NavLink({
  href,
  current = false,
  component: Component = "a",
  className,
  children,
}: {
  href: string;
  current?: boolean;
  component?: NavLinkComponent;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Component
      href={href}
      aria-current={current ? "page" : undefined}
      className={mergeClasses(
        `
          state-layer inline-flex h-control-lg -translate-y-0.5 items-center
          rounded-full border-thicker border-transparent px-4 type-heading-xl
          whitespace-nowrap text-on-primary-container
          aria-[current=page]:border-on-primary-container
        `,
        className,
      )}
    >
      <span className="translate-y-0.5">{children}</span>
    </Component>
  );
}
