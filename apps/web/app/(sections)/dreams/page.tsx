import { Card } from "@insaeng/design-system";

import { wobble } from "../../wobble";
import { SectionPage } from "../section-page";
import { dreams, heading } from "./dreams";

export default function DreamsPage() {
  return (
    <SectionPage slug="dreams" className="flex-1 justify-center">
      <h1 className="text-center type-display text-on-surface">{heading}</h1>
      <ul className="
        grid gap-6
        md:gap-8
        lg:grid-cols-3 lg:gap-10
      ">
        {dreams.map((dream) => (
          <li key={dream}>
            <Card
              wobble={wobble}
              tone="translucent"
              className="h-full"
              contentClassName="
                justify-center p-6 text-center
                md:p-8
                lg:p-10
              "
            >
              <p className="type-heading-md text-on-surface">{dream}</p>
            </Card>
          </li>
        ))}
      </ul>
    </SectionPage>
  );
}
