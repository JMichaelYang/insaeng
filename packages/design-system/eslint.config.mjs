import { defineConfig, globalIgnores } from "eslint/config";
import betterTailwindcss from "eslint-plugin-better-tailwindcss";
import { getDefaultSelectors } from "eslint-plugin-better-tailwindcss/defaults";
import {
  MatcherType,
  SelectorKind,
} from "eslint-plugin-better-tailwindcss/types";
import tseslint from "typescript-eslint";

export default defineConfig([
  ...tseslint.configs.recommended,
  {
    extends: [betterTailwindcss.configs["recommended-error"]],
    settings: {
      "better-tailwindcss": {
        entryPoint: "src/styles/tailwind.css",
        rootFontSize: 16,
        selectors: [
          ...getDefaultSelectors(),
          {
            kind: SelectorKind.Callee,
            name: "^mergeClasses$",
            match: [
              { type: MatcherType.String },
              { type: MatcherType.ObjectKey },
            ],
          },
        ],
      },
    },
  },
  globalIgnores(["src/generated/**"]),
]);
