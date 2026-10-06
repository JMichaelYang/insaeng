import { Avatar, Wedges, type WedgesLayout } from "@insaeng/design-system";
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
};
const column: WedgesLayout = {
  ...shared,
  avatarRadius: 80,
  cornerRadius: 12,
  centerGap: 8,
  relatedGap: 4,
};

export default function Home() {
  return (
    <main className="
      flex flex-1 flex-col p-2
      lg:p-5
    ">
      <Wedges className="flex-1" row={row} column={column}>
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
