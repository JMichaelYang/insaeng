import { WobbleBox } from "@insaeng/design-system";

import { wobble } from "../../wobble";
import { SectionBackdrop } from "../section-backdrop";

const name = "Jaewon Yang";

const links = [
  {
    label: "Email",
    value: "jaewonmichael@gmail.com",
    href: "mailto:jaewonmichael@gmail.com",
  },
  {
    label: "Phone",
    value: "(818) 438-5167",
    href: "tel:+18184385167",
  },
  {
    label: "LinkedIn",
    value: "in/jaewon-yang-b988a8153",
    href: "https://www.linkedin.com/in/jaewon-yang-b988a8153/",
  },
  {
    label: "GitHub",
    value: "JMichaelYang",
    href: "https://github.com/JMichaelYang",
  },
];

export default function ContactPage() {
  return (
    <main className="
      relative -mt-16 flex flex-1 flex-col
      lg:-mt-20
    ">
      <SectionBackdrop slug="contact" />
      <div className="
        relative mx-auto grid w-full max-w-6xl items-center gap-12 px-4 pt-24
        pb-16
        lg:grid-cols-2 lg:gap-16 lg:px-8 lg:pt-32 lg:pb-24
      ">
        <div className="flex flex-col gap-8">
          <header className="flex flex-col gap-3">
            <h1 className="type-display text-on-surface">{name}</h1>
            <p className="type-body-lg text-on-surface-variant">
              Reach out about a role, a project, or anything else.
            </p>
          </header>
          <WobbleBox wobble={wobble}>
            <ul className="flex flex-col gap-1 bg-surface-container-low p-3">
              {links.map((link) => {
                const external = link.href.startsWith("http");
                return (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target={external ? "_blank" : undefined}
                      rel={external ? "noreferrer" : undefined}
                      className="
                        state-layer flex flex-col gap-1 rounded-md p-3
                        text-on-surface
                      "
                    >
                      <span className="
                        type-caption tracking-wider text-on-surface-variant
                        uppercase
                      ">
                        {link.label}
                      </span>
                      <span className="type-heading-sm break-all text-primary">
                        {link.value}
                      </span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </WobbleBox>
        </div>
        <WobbleBox wobble={wobble}>
          <div className="
            bg-primary-container p-6
            lg:p-8
          ">
            <WobbleBox wobble={wobble}>
              <div
                role="img"
                aria-label="Photo placeholder"
                className="
                  flex aspect-square items-center justify-center
                  bg-surface-container-high
                "
              >
                <span className="type-label text-on-surface-variant">
                  Photo coming soon
                </span>
              </div>
            </WobbleBox>
          </div>
        </WobbleBox>
      </div>
    </main>
  );
}
