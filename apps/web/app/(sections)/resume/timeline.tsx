import { WobbleBox } from "@insaeng/design-system";

import { wobble } from "../../wobble";
import { Highlighted } from "./highlighted";
import { Dates } from "./panel";
import { roles } from "./resume";

export function Timeline() {
  return (
    <div className="relative">
      <WobbleBox
        aria-hidden
        wobble={wobble}
        edges={{ left: true }}
        className="absolute top-2 bottom-0 left-2 w-2"
      />
      <ol className="relative flex flex-col gap-10">
        {roles.map((role) => (
          <li key={role.company} className="relative flex flex-col gap-3 pl-10">
            <span
              aria-hidden
              className={`
                absolute top-0.5 -left-0.5 size-6 rounded-full border-thick
                border-on-surface
                lg:border-thicker
                ${role.current ? "bg-primary" : "bg-surface"}
              `}
            />
            <div className="flex flex-col gap-1">
              <div className="
                flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1
              ">
                <h3 className="type-heading-md text-on-surface">
                  {role.company}
                </h3>
                <Dates start={role.start} end={role.end} />
              </div>
              <p className="type-label text-on-surface">{role.title}</p>
              <p className="type-body-sm text-on-surface-variant">
                {role.focus}
              </p>
            </div>
            <ul className="
              flex list-disc flex-col gap-2 pl-5 type-body-md text-on-surface
              marker:text-outline
            ">
              {role.highlights.map((highlight) => (
                <li key={highlight}>
                  <Highlighted text={highlight} />
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </div>
  );
}
