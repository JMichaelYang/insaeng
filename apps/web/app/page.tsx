import {
  Avatar,
  type ImageSource,
  Wedges,
  type WedgesContent,
  type WedgesImages,
  type WedgesLayout,
} from "@insaeng/design-system";
import Image, { getImageProps } from "next/image";

const shared = {
  ringThickness: 0,
  wedgesPerSide: 4,
  spread: 1,
  cornerRadius: 0,
};

const row: WedgesLayout = {
  ...shared,
  avatarRadius: 176,
  centerGap: 12,
  relatedGap: 8,
  slotInset: 24,
};
const column: WedgesLayout = {
  ...shared,
  avatarRadius: 80,
  centerGap: 8,
  relatedGap: 4,
  slotInset: 16,
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

const placeholder: ImageSource = {
  mode: "svg",
  src: "/wedges/placeholder.svg",
};

function photo(src: string, width: number, height: number): ImageSource {
  const { props } = getImageProps({
    src,
    width,
    height,
    alt: "",
    sizes: "(min-width: 64rem) 50vw, 100vw",
  });
  return {
    mode: "raster",
    src: props.src,
    srcSet: props.srcSet,
    sizes: props.sizes,
  };
}

const images: WedgesImages = [
  [
    photo("/wedges/background.jpg", 1200, 1200),
    photo("/wedges/dreams.jpg", 1200, 1200),
    photo("/wedges/interests.jpg", 900, 900),
    photo("/wedges/sports.jpg", 1200, 1200),
  ],
  Array.from({ length: 4 }, () => placeholder),
];

export default function Home() {
  return (
    <main className="
      flex flex-1 flex-col p-2
      lg:p-5
    ">
      <Wedges
        className="flex-1"
        row={row}
        column={column}
        content={content}
        images={images}
        blur="lg"
      >
        <Avatar className="
          size-[10rem]
          lg:size-[22rem]
        ">
          <Image
            src="/headshot.jpg"
            alt="Jaewon Yang"
            width={720}
            height={720}
            sizes="(min-width: 64rem) 22rem, 10rem"
            preload
          />
        </Avatar>
      </Wedges>
    </main>
  );
}
