import { sectionBySlug } from "../../sections";
import { SectionPage } from "../section-page";
import { SportCard } from "./sport-card";
import { intro, sports } from "./sports";

export default function SportsPage() {
  const { title } = sectionBySlug("sports");
  return (
    <SectionPage slug="sports" className="max-w-5xl">
      <header className="flex flex-col items-center gap-3 text-center">
        <h1 className="type-display text-on-surface">{title}</h1>
        <p className="max-w-prose type-body-lg text-on-surface">
          {intro}
        </p>
      </header>
      <ul className="
        flex flex-col gap-8
        lg:gap-12
      ">
        {sports.map((sport, i) => (
          <li key={sport.name}>
            <SportCard sport={sport} flipped={i % 2 === 1} />
          </li>
        ))}
      </ul>
    </SectionPage>
  );
}
