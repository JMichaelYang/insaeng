import { defineConfig, globalIgnores } from "eslint/config";
import betterTailwindcss from "eslint-plugin-better-tailwindcss";
import tseslint from "typescript-eslint";

export default defineConfig([
  ...tseslint.configs.recommended,
  {
    extends: [betterTailwindcss.configs["recommended-error"]],
    settings: {
      "better-tailwindcss": {
        entryPoint: "src/styles/tailwind.css",
        rootFontSize: 16,
      },
    },
  },
  globalIgnores(["src/generated/**"]),
]);
