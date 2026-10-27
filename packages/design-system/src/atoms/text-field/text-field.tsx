import type { ComponentProps, ReactNode } from "react";

import { mergeClasses } from "../../utils/merge-classes";

const controlClasses = `
  w-full rounded-sm border-thin border-outline bg-surface px-3 type-body-md
  text-on-surface
`;

function Field({
  label,
  required,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={mergeClasses("flex flex-col gap-1", className)}>
      <span className="type-label text-on-surface-variant">
        {label}
        {required && <span aria-hidden> *</span>}
      </span>
      {children}
    </label>
  );
}

export function TextField({
  label,
  className,
  ...props
}: { label: string } & ComponentProps<"input">) {
  return (
    <Field label={label} required={props.required} className={className}>
      <input
        className={mergeClasses(controlClasses, "h-control-md")}
        {...props}
      />
    </Field>
  );
}

export function TextArea({
  label,
  className,
  rows = 4,
  ...props
}: { label: string } & ComponentProps<"textarea">) {
  return (
    <Field label={label} required={props.required} className={className}>
      <textarea
        rows={rows}
        className={mergeClasses(controlClasses, "resize-y py-2")}
        {...props}
      />
    </Field>
  );
}
