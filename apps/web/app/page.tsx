import { Avatar } from "@insaeng/design-system";
import Image from "next/image";

export default function Home() {
  return (
    <main className="
      relative flex flex-1 flex-col gap-5 p-4
      lg:flex-row lg:p-8
    ">
      <section className="
        flex-1 rounded-2xl border border-outline bg-surface-container-lowest p-6
        lg:p-12
      ">
        <h2 className="type-heading-lg text-on-surface">About Me</h2>
      </section>
      <section className="
        flex-1 rounded-2xl border border-outline bg-surface-container-lowest p-6
        lg:p-12
      ">
        <div className="
          pt-20
          lg:pt-0 lg:pl-32
        ">
          <h2 className="type-heading-lg text-on-surface">Career</h2>
        </div>
      </section>
      <div className="
        absolute top-1/2 left-1/2 -translate-1/2 rounded-full border
        border-outline bg-surface p-3
        lg:p-5
      ">
        <Avatar className="
          size-[9rem]
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
      </div>
    </main>
  );
}
