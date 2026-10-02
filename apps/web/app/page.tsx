import { Avatar, NotchedPanel } from "@insaeng/design-system";
import Image from "next/image";

const mobileNotch = { radius: 128, fillet: 12, offset: 4 };
const desktopNotch = { radius: 188, fillet: 16, offset: 6 };

export default function Home() {
  return (
    <main className="
      relative flex flex-1 flex-col gap-2 p-2
      lg:flex-row lg:gap-3 lg:p-5
    ">
      <NotchedPanel
        className="grow basis-0"
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
        className="grow basis-0"
        mobile={{ side: "top", notch: mobileNotch }}
        desktop={{ side: "left", notch: desktopNotch }}
      >
        <div className="
          p-6
          lg:p-12 lg:pl-20
        ">
          <div className="
            pt-32
            lg:pt-0 lg:pl-32
          ">
            <h2 className="type-heading-lg text-on-surface">Career</h2>
          </div>
        </div>
      </NotchedPanel>
      <Avatar className="
        absolute top-1/2 left-1/2 size-[15rem] -translate-1/2
        lg:size-[22rem]
      ">
        <Image
          src="/headshot.jpg"
          alt="Jaewon Yang"
          width={720}
          height={720}
          sizes="(min-width: 64rem) 22rem, 15rem"
          preload
        />
      </Avatar>
    </main>
  );
}
