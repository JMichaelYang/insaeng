import {
  Avatar,
  Wedges,
  type WedgesContent,
  type WedgesLayout,
} from "@insaeng/design-system";
import Image from "next/image";

const shared = {
  ringThickness: 0,
  wedgesPerSide: 4,
  spread: 0.8,
};

const row: WedgesLayout = {
  ...shared,
  avatarRadius: 176,
  cornerRadius: 16,
  centerGap: 12,
  relatedGap: 8,
  slotInset: 24,
};
const column: WedgesLayout = {
  ...shared,
  avatarRadius: 80,
  cornerRadius: 12,
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
