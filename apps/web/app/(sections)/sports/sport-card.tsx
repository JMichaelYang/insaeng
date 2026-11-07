import { Card } from "@insaeng/design-system";
import Image from "next/image";

import { wobble } from "../../wobble";
import type { Sport } from "./sports";

export function SportCard({ sport, flipped }: { sport: Sport; flipped: boolean }) {
  return (
    <Card
      wobble={wobble}
      as="article"
      contentClassName="
        grid gap-0 p-0
        md:grid-cols-2
      "
    >
      <div className={`
        relative aspect-square
        ${flipped ? "md:order-last" : ""}
      `}>
        <Image
          src={sport.photo}
          alt={sport.name}
          fill
          sizes="(min-width: 768px) 50vw, 100vw"
          className="object-cover"
        />
      </div>
      <div className="
        flex flex-col justify-center gap-4 p-6
        lg:p-10
      ">
        {sport.paragraphs.map((paragraph) => (
          <p key={paragraph} className="type-body-lg text-on-surface">
            {paragraph}
          </p>
        ))}
      </div>
    </Card>
  );
}
