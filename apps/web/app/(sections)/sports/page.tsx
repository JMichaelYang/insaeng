import { sectionBySlug } from "../../sections";
import { SectionBackdrop } from "../section-backdrop";
import { SportCard } from "./sport-card";
import { intro, sports } from "./sports";

export default function SportsPage() {
  const { title } = sectionBySlug("sports");
  return (
    <main className="
      relative -mt-16 flex flex-1 flex-col
      lg:-mt-20
    ">
      <SectionBackdrop slug="sports" />
      <div className="
        relative mx-auto flex w-full max-w-5xl flex-col gap-12 px-4 pt-24 pb-16
        lg:gap-16 lg:px-8 lg:pt-32 lg:pb-24
      ">
        <header className="flex flex-col items-center gap-3 text-center">
          <h1 className="type-display text-on-surface">{title}</h1>
          <p className="max-w-prose type-body-lg text-on-surface-variant">
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
      </div>
    </main>
  );
}
