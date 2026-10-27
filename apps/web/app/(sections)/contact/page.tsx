import { BrandIcon } from "@insaeng/design-system";
import { Mail, Phone, ThumbsUp } from "lucide-react";

import { ContactForm } from "./contact-form";

const email = "jaewonmichael@gmail.com";

const contacts = [
  { icon: Mail, label: email, href: `mailto:${email}` },
  { icon: Phone, label: "(818) 438-5167", href: "tel:+18184385167" },
];

const profiles = [
  {
    brand: "linkedin",
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/jaewon-yang-b988a8153/",
  },
  {
    brand: "github",
    label: "GitHub",
    href: "https://github.com/JMichaelYang",
  },
] as const;

export default function ContactPage() {
  return (
    <main className="
      mx-auto grid w-full max-w-5xl flex-1 grid-cols-1 content-center gap-12 p-6
      lg:grid-cols-2 lg:gap-16 lg:p-12
    ">
      <section className="
        flex flex-col gap-10
        lg:justify-between
      ">
        <div className="flex flex-col gap-4">
          <h1 className="type-display text-tertiary">Get in Touch</h1>
          <p className="type-heading-sm text-tertiary">
            I&apos;d like to hear from you!
          </p>
          <p className="max-w-xs type-body-md text-on-surface-variant">
            If you have any questions or just want to say hi, send me a
            message!
          </p>
        </div>
        <ul className="flex flex-col gap-2">
          {contacts.map(({ icon: Icon, label, href }) => (
            <li key={href} className="flex items-center gap-4">
              <Icon
                aria-hidden
                className="size-icon-lg shrink-0 text-on-surface-variant"
              />
              <a
                href={href}
                className="
                  state-layer -mx-2 rounded-full px-2 py-1 type-body-md
                  break-all text-on-surface underline underline-offset-4
                "
              >
                {label}
              </a>
            </li>
          ))}
          <li className="flex items-center gap-4">
            <ThumbsUp
              aria-hidden
              className="size-icon-lg shrink-0 text-on-surface-variant"
            />
            <div className="-mx-2 flex gap-1">
              {profiles.map(({ brand, label, href }) => (
                <a
                  key={brand}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="
                    state-layer inline-flex size-10 items-center justify-center
                    rounded-full text-on-surface
                  "
                >
                  <BrandIcon brand={brand} />
                </a>
              ))}
            </div>
          </li>
        </ul>
      </section>
      <ContactForm to={email} />
    </main>
  );
}
