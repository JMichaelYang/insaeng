import { Card } from "@insaeng/design-system";

import { wobble } from "../../wobble";
import { SectionPage } from "../section-page";
import { dreams, heading } from "./dreams";

export default function DreamsPage() {
  return (
    <SectionPage slug="dreams" className="flex-1 justify-center">
      <h1 className="text-center type-display text-on-surface">{heading}</h1>
      <ul className="
        grid gap-4
        md:grid-cols-3 md:gap-6
        lg:gap-8
      ">
        {dreams.map((dream) => (
          <li key={dream}>
            <Card
              wobble={wobble}
              tone="lowest"
              className="h-full"
              contentClassName="
                p-5
                md:p-6
                lg:p-8
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
