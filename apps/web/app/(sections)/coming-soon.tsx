import Image from "next/image";

import { type SectionSlug, sectionBySlug } from "../sections";

export function ComingSoon({ slug }: { slug: SectionSlug }) {
  const { title, photo } = sectionBySlug(slug);
  return (
    <main className="
      -mt-16 flex flex-1 flex-col
      lg:-mt-20
    ">
      <div className="
        relative aspect-square w-full
        md:aspect-video
      ">
        <Image src={photo} alt="" fill sizes="100vw" preload className="
          object-cover
        " />
        <div className="
          absolute inset-0 bg-linear-to-b from-transparent from-50% to-surface
        " />
      </div>
      <div className="
        flex flex-1 flex-col items-center justify-center gap-1 p-6 text-center
      ">
        <h1 className="type-display text-on-surface">{title}</h1>
        <p className="type-body-md text-on-surface-variant">Coming soon</p>
      </div>
    </main>
  );
}
