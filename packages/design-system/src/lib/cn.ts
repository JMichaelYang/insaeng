import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

import { semanticNames, themeNames } from "../generated/theme-names";

const twMerge = extendTailwindMerge<"type">({
  // Tailwind's default scales are cleared by the theme, so these replace them.
  override: {
    theme: Object.fromEntries(
      Object.entries(themeNames).map(([key, values]) => [key, [...values]]),
    ),
  },
  extend: {
    classGroups: {
      // Semantic colors that exist only for one utility (bg-canvas, text-muted).
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

/** Joins class names and resolves conflicting Tailwind utilities. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
