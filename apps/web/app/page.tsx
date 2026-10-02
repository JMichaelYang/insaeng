import { Avatar } from "@insaeng/design-system";
import Image from "next/image";

import { NotchedPanel } from "./_components/notched-panel";

const mobileNotch = { radius: 80, fillet: 12, offset: 4 };
const desktopNotch = { radius: 156, fillet: 12, offset: 6 };

export default function Home() {
  return (
    <main className="
      relative flex flex-1 flex-col gap-2 p-3
      lg:flex-row lg:gap-3 lg:p-6
    ">
      <NotchedPanel
        mobile={{ side: "bottom", notch: mobileNotch }}
        desktop={{ side: "right", notch: desktopNotch }}
      >
        <div className="
          p-6
          lg:p-12
        ">
          <h2 className="type-heading-lg text-on-surface">About Me</h2>
        </div>
      </NotchedPanel>
      <NotchedPanel
        mobile={{ side: "top", notch: mobileNotch }}
        desktop={{ side: "left", notch: desktopNotch }}
      >
        <div className="
          p-6 pt-24
          lg:p-12 lg:pl-32
        ">
          <h2 className="type-heading-lg text-on-surface">Career</h2>
        </div>
      </NotchedPanel>
      <Avatar className="
        absolute top-1/2 left-1/2 size-[9rem] -translate-1/2
        lg:size-[18rem]
      ">
        <Image
          src="/headshot.jpg"
          alt="Jaewon Yang"
          width={720}
          height={720}
          sizes="(min-width: 64rem) 18rem, 9rem"
          preload
        />
      </Avatar>
    </main>
  );
}
