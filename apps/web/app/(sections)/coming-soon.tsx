import { type SectionSlug, sectionBySlug } from "../sections";
import { SectionPhoto } from "./section-photo";

export function ComingSoon({ slug }: { slug: SectionSlug }) {
  const { title } = sectionBySlug(slug);
  return (
    <main className="
      relative -mt-16 flex flex-1 flex-col items-center justify-center p-6
      lg:-mt-20
    ">
      <SectionPhoto slug={slug} />
      <div className="relative flex flex-col items-center gap-1 text-center">
        <h1 className="type-display text-on-surface">{title}</h1>
        <p className="type-body-md text-on-surface-variant">Coming soon</p>
      </div>
    </main>
  );
}
