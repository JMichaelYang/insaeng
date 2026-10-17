import { notFound } from "next/navigation";

import { findSection, sections } from "../../sections";

export const dynamicParams = false;

export function generateStaticParams() {
  return sections.flat().map(({ slug }) => ({ section: slug }));
}

export default async function SectionPage({
  params,
}: PageProps<"/[section]">) {
  const section = findSection((await params).section);
  if (!section) notFound();
  return (
    <main className="
      flex flex-1 flex-col items-center justify-center gap-1 p-6 text-center
    ">
      <h1 className="type-display text-on-surface">{section.title}</h1>
      <p className="type-body-md text-on-surface-variant">Coming soon</p>
    </main>
  );
}
