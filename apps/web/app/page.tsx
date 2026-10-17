import {
  Avatar,
  type ImageSource,
  type WedgesLayout,
  type WedgesSides,
  WobbleText,
} from "@insaeng/design-system";
import Image, { getImageProps } from "next/image";
import { ViewTransition } from "react";
import { preload } from "react-dom";

import {
  headshot,
  headshotSizes,
  headshotTransition,
  preloadHeadshot,
} from "./headshot";
import { LinkedWedges } from "./linked-wedges";
import { type Section, sectionHref, sections } from "./sections";
import { lgWobble, titleWobble, wobble } from "./wobble";

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
  wobble: lgWobble,
};
const column: WedgesLayout = {
  ...shared,
  avatarRadius: 88,
  slotInset: 16,
  wobble,
};

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
  preloadHeadshot(headshotSizes.nav);
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
        <ViewTransition name={headshotTransition} share="morph" default="none">
          <Avatar shape="square" className="
            size-[11.5rem]
            lg:size-[25rem]
          ">
            <Image
              {...headshot}
              alt="Jaewon Yang"
              sizes={headshotSizes.home}
              preload
            />
          </Avatar>
        </ViewTransition>
      </LinkedWedges>
    </main>
  );
}
