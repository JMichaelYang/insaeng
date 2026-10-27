"use client";

import { Button, TextArea, TextField } from "@insaeng/design-system";
import type { FormEvent } from "react";

export function ContactForm({ to }: { to: string }) {
  function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const field = (key: string) => String(data.get(key) ?? "").trim();
    const name = [field("firstName"), field("lastName")]
      .filter(Boolean)
      .join(" ");
    const subject = name ? `Hello from ${name}` : "Hello";
    const signature = [name, field("email")].filter(Boolean).join("\n");
    const body = [field("message"), signature].filter(Boolean).join("\n\n");
    const query = `subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = `mailto:${to}?${query}`;
  }

  return (
    <form
      onSubmit={send}
      className="
        grid grid-cols-1 gap-4
        sm:grid-cols-2
      "
    >
      <TextField
        label="First name"
        name="firstName"
        autoComplete="given-name"
      />
      <TextField
        label="Last name"
        name="lastName"
        autoComplete="family-name"
      />
      <TextField
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        required
        className="sm:col-span-2"
      />
      <TextArea
        label="Message"
        name="message"
        rows={5}
        className="sm:col-span-2"
      />
      <Button
        type="submit"
        tone="tertiary"
        className="
          justify-self-end
          sm:col-span-2
        "
      >
        Send
      </Button>
    </form>
  );
}
