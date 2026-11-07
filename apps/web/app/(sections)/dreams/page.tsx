import { Card } from "@insaeng/design-system";

import { wobble } from "../../wobble";
import { SectionPage } from "../section-page";
import { dreams, heading } from "./dreams";

export default function DreamsPage() {
  return (
    <SectionPage
      slug="dreams"
      className="
        flex-1 justify-center
        lg:max-w-5xl
      "
    >
      <h1 className="text-center type-display text-on-surface">{heading}</h1>
      <ol className="
        grid gap-4
        md:grid-cols-3 md:gap-6
        lg:gap-8
      ">
        {dreams.map((dream, i) => (
          <li key={dream}>
            <Card
              wobble={wobble}
              tone="lowest"
              className="h-full"
              contentClassName="
                flex-row items-baseline gap-4 p-5
                md:flex-col md:gap-6 md:p-6
                lg:p-8
              "
            >
              <span aria-hidden className="
                type-display text-primary tabular-nums
              ">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="type-heading-md text-on-surface">{dream}</p>
            </Card>
          </li>
        ))}
      </ol>
    </SectionPage>
  );
}
