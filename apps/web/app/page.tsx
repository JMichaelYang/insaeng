import {
  Avatar,
  type ImageSource,
  type TextWobble,
  type WedgesContent,
  type WedgesImages,
  type WedgesLayout,
  type WedgesLinks,
  WobbleText,
} from "@insaeng/design-system";
import Image, { getImageProps } from "next/image";
import { preload } from "react-dom";

import { LinkedWedges } from "./linked-wedges";
import { sectionHref, sections } from "./sections";

const shared = {
  centerGap: 0,
  relatedGap: 0,
  wedgesPerSide: 4,
  spread: 1,
  cornerRadius: 0,
} as const;

const row: WedgesLayout = {
  ...shared,
  avatarRadius: 192,
  slotInset: 24,
  wobble: { amplitude: 3, wavelength: 30 },
};
const column: WedgesLayout = {
  ...shared,
  avatarRadius: 88,
  slotInset: 16,
  wobble: { amplitude: 2, wavelength: 20 },
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

const content: WedgesContent = [
  sections[0].map(({ slug, title }) => <WedgeTitle key={slug} title={title} />),
  sections[1].map(({ slug, title }) => <WedgeTitle key={slug} title={title} />),
];

const hrefs: WedgesLinks["hrefs"] = [
  sections[0].map(sectionHref),
  sections[1].map(sectionHref),
];

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

const images: WedgesImages = [
  sections[0].map(({ image }) => photo(image)),
  sections[1].map(({ image }) => photo(image)),
];

export default function Home() {
  for (const image of images.flat()) {
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
        content={content}
        images={images}
        hrefs={hrefs}
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
