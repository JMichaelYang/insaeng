"use client";

import { colorSchemes } from "@insaeng/design-system";
import { type ChangeEvent, useId, useSyncExternalStore } from "react";

import { type RootAttribute, rootAttributes } from "./color-scheme";

const themes = ["system", "light", "dark"] as const;

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributeFilter: Object.keys(rootAttributes).map((name) => `data-${name}`),
  });
  return () => observer.disconnect();
}

function useRootAttribute(name: RootAttribute) {
  const { fallback } = rootAttributes[name];
  return useSyncExternalStore(
    subscribe,
    () => document.documentElement.dataset[name] ?? fallback,
    () => fallback,
  );
}

function setRootAttribute(name: RootAttribute, value: string) {
  const { storageKey, fallback } = rootAttributes[name];
  const { dataset } = document.documentElement;
  if (value === fallback) delete dataset[name];
  else dataset[name] = value;
  try {
    if (value === fallback) localStorage.removeItem(storageKey);
    else localStorage.setItem(storageKey, value);
  } catch {}
}

const title = (name: string) => name[0].toUpperCase() + name.slice(1);

function Picker({
  label,
  name,
  options,
}: {
  label: string;
  name: RootAttribute;
  options: readonly string[];
}) {
  const id = useId();
  const value = useRootAttribute(name);
  const onChange = (event: ChangeEvent<HTMLSelectElement>) =>
    setRootAttribute(name, event.target.value);
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="type-label text-on-surface-variant">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={onChange}
        className="
          h-control-sm rounded-md border-thin border-outline
          bg-surface-container-lowest px-2 type-body-sm text-on-surface
        "
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {title(option)}
          </option>
        ))}
      </select>
    </div>
  );
}

export function SchemePicker() {
  return (
    <div
      role="group"
      aria-label="Color scheme preview"
      className="
        fixed right-4 bottom-4 z-toast flex gap-3 rounded-lg
        bg-surface-container-high p-3 shadow-lg
      "
    >
      <Picker
        label="Scheme"
        name="scheme"
        options={[rootAttributes.scheme.fallback, ...colorSchemes]}
      />
      <Picker label="Mode" name="theme" options={themes} />
    </div>
  );
}
