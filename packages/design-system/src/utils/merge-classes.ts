import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

import { semanticNames, themeNames } from "../generated/theme-names";

const twMerge = extendTailwindMerge<"type">({
  override: {
    theme: Object.fromEntries(
      Object.entries(themeNames).map(([key, values]) => [key, [...values]]),
    ),
  },
  extend: {
    classGroups: {
      h: [{ h: semanticNames.control.map((n) => `control-${n}`) }],
      "min-h": [{ "min-h": semanticNames.control.map((n) => `control-${n}`) }],
      size: [{ size: semanticNames.icon.map((n) => `icon-${n}`) }],
      type: [{ type: [...semanticNames.type] }],
    },
    conflictingClassGroups: {
      type: ["font-family", "font-size", "font-weight", "leading", "tracking"],
    },
  },
});

export function mergeClasses(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
