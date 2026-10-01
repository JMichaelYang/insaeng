import Image from "next/image";

export default function Home() {
  return (
    <div className="
      flex flex-1 flex-col items-center justify-center bg-canvas font-sans
    ">
      <main className="
        flex w-full max-w-3xl flex-1 flex-col items-center justify-between
        bg-surface px-16 py-32
        sm:items-start
      ">
        <Image
          className="
            h-5 w-25
            dark:invert
          "
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        <div className="
          flex flex-col items-center gap-stack-lg text-center
          sm:items-start sm:text-left
        ">
          <h1 className="max-w-xs type-heading-lg text-strong">
            To get started, edit the{" "}
            <code className="
              rounded-sm bg-surface-sunken px-1.5 py-0.5 font-mono text-[0.9em]
            ">
              page.tsx
            </code>{" "}
            file.
          </h1>
          <p className="max-w-md type-body-lg text-muted">
            Looking for a starting point or more instructions? Head over to{" "}
            <a
              href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              className="font-medium text-strong"
            >
              Templates
            </a>{" "}
            or the{" "}
            <a
              href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              className="font-medium text-strong"
            >
              Learning
            </a>{" "}
            center.
          </p>
        </div>
        <div className="
          flex flex-col gap-stack-md type-label
          sm:flex-row
        ">
          <a
            className="
              flex h-control-lg w-full items-center justify-center gap-inline-sm
              rounded-full bg-primary px-5 text-on-primary transition-colors
              duration-fast ease-standard
              hover:bg-primary-hover
              md:w-39.5
            "
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className="h-3.5 w-4 invert"
              src="/vercel.svg"
              alt="Vercel logomark"
              width={16}
              height={14}
            />
            Deploy Now
          </a>
          <a
            className="
              flex h-control-lg w-full items-center justify-center rounded-full
              border border-solid border-strong px-5 text-default
              transition-colors duration-fast ease-standard
              hover:bg-surface-sunken
              md:w-39.5
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
