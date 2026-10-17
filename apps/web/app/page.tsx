import {
  Avatar,
  type ImageSource,
  type TextWobble,
  type WedgesLayout,
  type WedgesSides,
  WobbleText,
} from "@insaeng/design-system";
import Image, { getImageProps } from "next/image";
import { preload } from "react-dom";

import { LinkedWedges } from "./linked-wedges";
import { type Section, sectionHref, sections } from "./sections";

const shared = {
  centerGap: 0,
  relatedGap: 0,
  spread: 1,
  cornerRadius: 0,
} as const;

const row: WedgesLayout = {
  ...shared,
  avatarRadius: 192,
  slotInset: 24,
  wobble: { amplitude: 2.5, wavelength: 30 },
};
const column: WedgesLayout = {
  ...shared,
  avatarRadius: 88,
  slotInset: 16,
  wobble: { amplitude: 1.75, wavelength: 20 },
};

const titleWobble: TextWobble = { amplitude: 0.035, period: 4 };

function WedgeTitle({ title }: { title: string }) {
  return (
    <h2 className="
      type-heading-xl whitespace-nowrap text-on-surface
      lg:type-display
    ">
      <WobbleText text={title} wobble={titleWobble} />
    </h2>
  );
}

const photoSize = 256;

function photo(src: string): ImageSource {
  const { props } = getImageProps({
    src,
    width: photoSize,
    height: photoSize,
    alt: "",
  });
  return { mode: "raster", src: props.src, srcSet: props.srcSet };
}

const wedge = (section: Section) => ({
  content: <WedgeTitle title={section.title} />,
  image: photo(section.image),
  href: sectionHref(section),
});

const sides: WedgesSides = [sections[0].map(wedge), sections[1].map(wedge)];

export default function Home() {
  for (const { image } of sides.flat()) {
    if (!image) continue;
    preload(image.src, {
      as: "image",
      imageSrcSet: image.mode === "raster" ? image.srcSet : undefined,
    });
  }
  return (
    <main className="flex flex-1 flex-col">
      <LinkedWedges
        className="flex-1"
        row={row}
        column={column}
        sides={sides}
        blur="md"
        tilt
      >
        <Avatar shape="square" className="
          size-[11.5rem]
          lg:size-[25rem]
        ">
          <Image
            src="/headshot.jpg"
            alt="Jaewon Yang"
            width={720}
            height={720}
            sizes="(min-width: 64rem) 25rem, 11.5rem"
            preload
          />
        </Avatar>
      </LinkedWedges>
    </main>
  );
}
