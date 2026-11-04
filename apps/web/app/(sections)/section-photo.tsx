import Image from "next/image";

import { type SectionSlug, sectionBySlug } from "../sections";

export function SectionPhoto({ slug }: { slug: SectionSlug }) {
  const { photo } = sectionBySlug(slug);
  return (
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
  );
}
