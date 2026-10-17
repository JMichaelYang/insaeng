import {
  Avatar,
  type ImageSource,
  Wedges,
  type WedgesContent,
  type WedgesImages,
  type WedgesLayout,
} from "@insaeng/design-system";
import Image, { getImageProps } from "next/image";
import { preload } from "react-dom";

const shared = {
  centerShape: "square",
  centerGap: 0,
  relatedGap: 0,
  ringThickness: 0,
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

function Placeholder({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <span className="
        type-label text-on-surface
        lg:type-heading-sm
      ">{title}</span>
      <span className="type-caption text-on-surface-variant">Coming soon</span>
    </div>
  );
}

const content: WedgesContent = [
  ["One", "Two", "Three", "Four"].map((title) => (
    <Placeholder key={title} title={title} />
  )),
  ["Five", "Six", "Seven", "Eight"].map((title) => (
    <Placeholder key={title} title={title} />
  )),
];

const photoSize = 512;

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
  [
    photo("/wedges/background.jpg"),
    photo("/wedges/sports.jpg"),
    photo("/wedges/interests.jpg"),
    photo("/wedges/dreams.jpg"),
  ],
  [
    photo("/wedges/mission.jpg"),
    photo("/wedges/resume.jpg"),
    photo("/wedges/projects.png"),
    photo("/wedges/contact.jpg"),
  ],
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
      <Wedges
        className="flex-1"
        row={row}
        column={column}
        content={content}
        images={images}
        blur="lg"
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
      </Wedges>
    </main>
  );
}
