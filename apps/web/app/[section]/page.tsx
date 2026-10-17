import { notFound } from "next/navigation";

import { headshotSizes, preloadHeadshot } from "../headshot";
import { findSection, sections } from "../sections";
import { SectionNav } from "./section-nav";

export const dynamicParams = false;

export function generateStaticParams() {
  return sections.flat().map(({ slug }) => ({ section: slug }));
}

export default async function SectionPage({
  params,
}: PageProps<"/[section]">) {
  const section = findSection((await params).section);
  if (!section) notFound();
  preloadHeadshot(headshotSizes.home);
  return (
    <>
      <SectionNav current={section.slug} />
      <main className="
        flex flex-1 flex-col items-center justify-center gap-1 p-6 text-center
      ">
        <h1 className="type-display text-on-surface">{section.title}</h1>
        <p className="type-body-md text-on-surface-variant">Coming soon</p>
      </main>
    </>
  );
}
