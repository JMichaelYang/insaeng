import { Card } from "@insaeng/design-system";

import { wobble } from "../../wobble";
import { impacts } from "./resume";

export function Impacts() {
  return (
    <ul
      aria-label="Highlights"
      className="
        grid grid-cols-2 gap-4
        lg:grid-cols-4 lg:gap-6
      "
    >
      {impacts.map((impact) => (
        <li key={impact.source}>
          <Card
            wobble={wobble}
            tone="lowest"
            className="h-full"
            contentClassName="
              gap-2 p-4
              lg:p-6
            "
          >
            <p className="type-display text-primary">
              {impact.value}
            </p>
            <p className="flex-1 type-body-sm text-on-surface">
              {impact.label}
            </p>
            <p className="
              type-caption tracking-wider text-on-surface-variant uppercase
            ">
              {impact.source}
            </p>
          </Card>
        </li>
      ))}
    </ul>
  );
}
