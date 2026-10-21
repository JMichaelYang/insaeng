import { WobbleBox } from "@insaeng/design-system";

import { lgWobble, wobble } from "../../wobble";

const links = [
  { label: "jaewonmichael@gmail.com", href: "mailto:jaewonmichael@gmail.com" },
  { label: "(818) 438-5167", href: "tel:+18184385167" },
  {
    label: "linkedin.com/in/jaewon-yang-b988a8153",
    href: "https://www.linkedin.com/in/jaewon-yang-b988a8153/",
    external: true,
  },
  {
    label: "github.com/JMichaelYang",
    href: "https://github.com/JMichaelYang",
    external: true,
  },
];

export default function ContactPage() {
  return (
    <main className="
      mx-auto grid w-full max-w-5xl flex-1 grid-cols-1 content-center gap-12 p-6
      lg:grid-cols-2 lg:items-center lg:gap-16 lg:p-12
    ">
      <section className="flex flex-col gap-6">
        <h1 className="type-display text-on-surface">Jaewon Yang</h1>
        <ul className="flex flex-col gap-2">
          {links.map(({ label, href, external }) => (
            <li key={href}>
              <a
                href={href}
                target={external ? "_blank" : undefined}
                rel={external ? "noreferrer" : undefined}
                className="
                  state-layer -mx-3 inline-flex min-h-control-md items-center
                  rounded-full px-3 type-body-lg break-all text-on-surface
                  underline underline-offset-4
                "
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
      </section>
      <WobbleBox
        wobble={wobble}
        lgWobble={lgWobble}
        className="aspect-square w-full"
      >
        <div className="
          size-full bg-tertiary-container p-6
          lg:p-10
        ">
          <div
            role="img"
            aria-label="Placeholder image"
            className="size-full bg-surface-container-high"
          />
        </div>
      </WobbleBox>
    </main>
  );
}
