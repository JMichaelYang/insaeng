import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import StyleDictionary from "style-dictionary";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "src/generated");

const TRANSFORMS = [
  "color/css",
  "fontFamily/css",
  "cubicBezier/css",
  "shadow/css/shorthand",
];

async function load(source) {
  const sd = new StyleDictionary({
    source: source.map((file) => path.join(root, "tokens", file)),
    usesDtcg: true,
    log: { verbosity: "verbose", warnings: "error" },
    platforms: { css: { transforms: TRANSFORMS } },
  });
  const { allTokens } = await sd.getPlatformTokens("css");
  return allTokens;
}

const base = await load([
  "color/palette.json",
  "color/light.json",
  "typography.json",
  "space.json",
  "effects.json",
]);
const dark = (await load(["color/palette.json", "color/dark.json"])).filter(
  (t) => t.path[0] === "color",
);

function themeVar([group, ...rest]) {
  const name = rest.join("-");
  switch (group) {
    case "palette":
      return `--color-${name}`;
    case "color": {
      const [kind, variant] = rest;
      if (kind === "bg") return `--background-color-${variant}`;
      if (kind === "text") return `--text-color-${variant}`;
      if (kind === "border") return `--border-color-${variant}`;
      if (variant === "default") return `--color-${kind}`;
      if (variant === "on") return `--color-on-${kind}`;
      if (variant.startsWith("on-")) return `--color-on-${kind}-${variant.slice(3)}`;
      return `--color-${kind}-${variant}`;
    }
    case "font": {
      const [kind, variant] = rest;
      if (kind === "family") return `--font-${variant}`;
      if (kind === "weight") return `--font-weight-${variant}`;
      if (kind === "size") return `--text-${variant}`;
      if (kind === "line-height") return `--leading-${variant}`;
      if (kind === "letter-spacing") return `--tracking-${variant}`;
      break;
    }
    case "spacing":
      return rest[0] === "base" ? "--spacing" : `--spacing-${name}`;
    case "size":
      return rest[0] === "container"
        ? `--container-${rest[1]}`
        : `--spacing-${name}`;
    case "breakpoint":
      return `--breakpoint-${name}`;
    case "radius":
      return `--radius-${name}`;
    case "border-width":
      return `--border-width-${name}`;
    case "shadow":
      return `--shadow-${name}`;
    case "opacity":
      return `--opacity-${name}`;
    case "duration":
      return `--transition-duration-${name}`;
    case "easing":
      return `--ease-${name}`;
    case "z-index":
      return `--z-index-${name}`;
    case "typography":
      return null;
  }
  throw new Error(`No Tailwind namespace for token ${[group, ...rest].join(".")}`);
}

const RESETS = [
  "--color-*",
  "--font-*",
  "--font-weight-*",
  "--text-*",
  "--leading-*",
  "--tracking-*",
  "--container-*",
  "--breakpoint-*",
  "--radius-*",
  "--shadow-*",
  "--ease-*",
];

const decl = (t) => `  ${themeVar(t.path)}: ${t.$value};`;
const themed = base.filter((t) => themeVar(t.path));

const themeCss = `@theme {
${RESETS.map((r) => `  ${r}: initial;`).join("\n")}

${themed.map(decl).join("\n")}
}

@layer theme {
  @media (prefers-color-scheme: dark) {
    :root:not([data-theme="light"]) {
${dark.map((t) => `    ${decl(t)}`).join("\n")}
    }
  }

  :root[data-theme="dark"] {
${dark.map(decl).join("\n")}
  }
}
`;

const fontFamily = (v) => (Array.isArray(v) ? v.join(", ") : v);
const typography = base.filter((t) => t.path[0] === "typography");
const typographyCss = `${typography
  .map(({ path: p, $value: v }) => `@utility type-${p.slice(1).join("-")} {
  font-family: ${fontFamily(v.fontFamily)};
  font-size: ${v.fontSize};
  font-weight: ${v.fontWeight};
  line-height: ${v.lineHeight};
  letter-spacing: ${v.letterSpacing};
}`)
  .join("\n\n")}
`;

const keys = (prefix) =>
  themed
    .map((t) => themeVar(t.path))
    .filter((v) => v.startsWith(prefix))
    .map((v) => v.slice(prefix.length));
const themeNames = {
  color: keys("--color-"),
  font: keys("--font-").filter((k) => !k.startsWith("weight-")),
  "font-weight": keys("--font-weight-"),
  text: keys("--text-").filter((k) => !k.startsWith("color-")),
  leading: keys("--leading-"),
  tracking: keys("--tracking-"),
  spacing: keys("--spacing-"),
  container: keys("--container-"),
  breakpoint: keys("--breakpoint-"),
  radius: keys("--radius-"),
  shadow: keys("--shadow-"),
  ease: keys("--ease-"),
};
const semantic = {
  bg: keys("--background-color-"),
  text: keys("--text-color-"),
  border: keys("--border-color-"),
  type: typography.map((t) => t.path.slice(1).join("-")),
};
const namesTs = `export const themeNames = ${JSON.stringify(themeNames, null, 2)} as const;

export const semanticNames = ${JSON.stringify(semantic, null, 2)} as const;
`;

await mkdir(outDir, { recursive: true });
await Promise.all([
  writeFile(path.join(outDir, "theme.css"), themeCss),
  writeFile(path.join(outDir, "typography.css"), typographyCss),
  writeFile(path.join(outDir, "theme-names.ts"), namesTs),
]);
console.log(`Wrote ${themed.length} theme variables, ${dark.length} dark overrides, ${typography.length} text styles to src/generated`);
