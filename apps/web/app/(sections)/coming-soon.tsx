import Image from "next/image";

import { type SectionSlug, sectionBySlug } from "../sections";

export function ComingSoon({ slug }: { slug: SectionSlug }) {
  const { title, photo } = sectionBySlug(slug);
  return (
    <main className="
      relative -mt-16 flex flex-1 flex-col items-center justify-center p-6
      lg:-mt-20
    ">
      <div className="
        absolute inset-x-0 top-0 aspect-square max-h-full overflow-hidden
        md:aspect-video
      ">
        <div className="absolute -inset-12">
          <Image
            src={photo}
            alt=""
            fill
            sizes="100vw"
            preload
            className="object-cover blur-lg"
          />
        </div>
        <div className="
          absolute inset-0 bg-linear-to-b from-surface/75 from-50% to-surface
        " />
      </div>
      <div className="relative flex flex-col items-center gap-1 text-center">
        <h1 className="type-display text-on-surface">{title}</h1>
        <p className="type-body-md text-on-surface-variant">Coming soon</p>
      </div>
    </main>
  );
}
