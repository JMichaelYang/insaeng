import { WobbleBox } from "@insaeng/design-system";
import type { ReactNode } from "react";

import { wobble } from "../../wobble";
import type { Entry } from "./resume";

export function Panel({
  title,
  className,
  children,
}: {
  title: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <WobbleBox wobble={wobble} className={className}>
      <section className="
        flex size-full flex-col gap-4 bg-surface-container-low p-6
      ">
        <h2 className="type-heading-xl text-on-surface">
          {title}
        </h2>
        {children}
      </section>
    </WobbleBox>
  );
}

const chipTones = {
  primary: "bg-primary-container text-on-primary-container",
  secondary: "bg-secondary-container text-on-secondary-container",
  tertiary: "bg-tertiary-container text-on-tertiary-container",
} as const;

export function Chips({
  items,
  tone = "secondary",
  label,
}: {
  items: string[];
  tone?: keyof typeof chipTones;
  label?: string;
}) {
  return (
    <ul aria-label={label} className="flex flex-wrap gap-2">
      {items.map((item) => (
        <li
          key={item}
          className={`
            rounded-full px-3 py-1 type-label
            ${chipTones[tone]}
          `}
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

export function Dates({ start, end }: { start: string; end: string }) {
  return (
    <p className="type-caption whitespace-nowrap text-on-surface-variant">
      {start} – {end}
    </p>
  );
}

export function Entries({ entries }: { entries: Entry[] }) {
  return (
    <ul className="flex flex-col gap-4">
      {entries.map((entry) => (
        <li key={entry.name} className="flex flex-col gap-1">
          <div className="flex flex-wrap items-baseline justify-between gap-x-3">
            <h3 className="type-heading-sm text-on-surface">{entry.name}</h3>
            <Dates start={entry.start} end={entry.end} />
          </div>
          {entry.details.map((detail) => (
            <p key={detail} className="type-body-sm text-on-surface-variant">
              {detail}
            </p>
          ))}
        </li>
      ))}
    </ul>
  );
}
