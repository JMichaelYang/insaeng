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
      "bg-color": [{ bg: [...semanticNames.bg] }],
      "text-color": [{ text: [...semanticNames.text] }],
      "border-color": [{ border: [...semanticNames.border] }],
      type: [{ type: [...semanticNames.type] }],
    },
    conflictingClassGroups: {
      type: ["font-family", "font-size", "font-weight", "leading", "tracking"],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
