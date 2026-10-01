import Image from "next/image";

export default function Home() {
  return (
    <div className="
      flex flex-1 flex-col items-center justify-center bg-surface font-sans
    ">
      <main className="
        flex w-full max-w-3xl flex-1 flex-col items-center justify-between
        bg-surface-container-lowest px-16 py-32
        sm:items-start
      ">
        <Image
          className="
            h-5 w-[100px]
            dark:invert
          "
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        <div className="
          flex flex-col items-center gap-6 text-center
          sm:items-start sm:text-left
        ">
          <h1 className="max-w-xs type-heading-lg text-on-surface">
            To get started, edit the{" "}
            <code className="
              rounded-sm bg-surface-container px-1 py-0.5 font-mono text-[0.9em]
            ">
              page.tsx
            </code>{" "}
            file.
          </h1>
          <p className="max-w-md type-body-lg text-on-surface-variant">
            Looking for a starting point or more instructions? Head over to{" "}
            <a
              href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              className="font-medium text-on-surface"
            >
              Templates
            </a>{" "}
            or the{" "}
            <a
              href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              className="font-medium text-on-surface"
            >
              Learning
            </a>{" "}
            center.
          </p>
        </div>
        <div className="
          flex flex-col gap-4 type-label
          sm:flex-row
        ">
          <a
            className="
              state-layer flex h-control-lg w-full items-center justify-center
              gap-2 rounded-full bg-primary px-5 text-on-primary
              md:w-[158px]
            "
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className="h-[14px] w-4"
              src="/vercel.svg"
              alt="Vercel logomark"
              width={16}
              height={14}
            />
            Deploy Now
          </a>
          <a
            className="
              state-layer flex h-control-lg w-full items-center justify-center
              rounded-full border border-solid border-outline px-5
              text-on-surface
              md:w-[158px]
            "
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Documentation
          </a>
        </div>
      </main>
    </div>
  );
}
