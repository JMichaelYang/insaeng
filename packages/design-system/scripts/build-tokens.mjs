import { mkdir, rm, writeFile } from "node:fs/promises";
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
      return null;
    case "color":
      return `--color-${name}`;
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
      return `--spacing-${name}`;
    case "size":
      return rest[0] === "container"
        ? `--container-${rest[1]}`
        : `--size-${name}`;
    case "breakpoint":
      return `--breakpoint-${name}`;
    case "radius":
      return `--radius-${name}`;
    case "border-width":
      return `--border-width-${name}`;
    case "shadow":
      return `--shadow-${name}`;
    case "blur":
      return `--blur-${name}`;
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
  "--spacing",
  "--spacing-*",
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
  "--blur-*",
  "--ease-*",
];

const paletteRef = /^\{palette\.([^}]+)\}$/;
const value = (t) => {
  const ref = typeof t.original.$value === "string" && t.original.$value.match(paletteRef);
  return ref ? `var(--palette-${ref[1].replaceAll(".", "-")})` : t.$value;
};
const roleVar = (t) => `--role-${t.path.slice(1).join("-")}`;
const isRole = (t) => t.path[0] === "color";
const decl = (t) =>
  isRole(t)
    ? `  ${themeVar(t.path)}: var(${roleVar(t)});`
    : `  ${themeVar(t.path)}: ${t.$value};`;
const roleDecl = (indent) => (t) => `${indent}${roleVar(t)}: ${value(t)};`;
const themed = base.filter((t) => themeVar(t.path));
const palette = base.filter((t) => t.path[0] === "palette");
const roles = base.filter(isRole);

const themeCss = `@theme {
${RESETS.map((r) => `  ${r}: initial;`).join("\n")}

${themed.map(decl).join("\n")}
}

@layer theme {
  :root {
${palette.map((t) => `    --palette-${t.path.slice(1).join("-")}: ${t.$value};`).join("\n")}

${roles.map(roleDecl("    ")).join("\n")}
  }

  @media (prefers-color-scheme: dark) {
    :root:not([data-theme="light"]) {
${dark.map(roleDecl("      ")).join("\n")}
    }
  }

  :root[data-theme="dark"] {
${dark.map(roleDecl("    ")).join("\n")}
  }
}
`;

const fontFamily = (v) => (Array.isArray(v) ? v.join(", ") : v);
const typography = base.filter((t) => t.path[0] === "typography");
const sizeNames = (kind) =>
  base
    .filter((t) => t.path[0] === "size" && t.path[1] === kind)
    .map((t) => t.path[2]);

const utilitiesCss = `${typography
  .map(({ path: p, $value: v }) => `@utility type-${p.slice(1).join("-")} {
  font-family: ${fontFamily(v.fontFamily)};
  font-size: ${v.fontSize};
  font-weight: ${v.fontWeight};
  line-height: ${v.lineHeight};
  letter-spacing: ${v.letterSpacing};
}`)
  .join("\n\n")}

@utility h-control-* {
  height: --value(--size-control-*);
}

@utility min-h-control-* {
  min-height: --value(--size-control-*);
}

@utility size-icon-* {
  width: --value(--size-icon-*);
  height: --value(--size-icon-*);
}
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
  spacing: keys("--spacing-").map((k) => k.replace("_", ".")),
  container: keys("--container-"),
  breakpoint: keys("--breakpoint-"),
  radius: keys("--radius-"),
  shadow: keys("--shadow-"),
  blur: keys("--blur-"),
  ease: keys("--ease-"),
};
const semantic = {
  type: typography.map((t) => t.path.slice(1).join("-")),
  control: sizeNames("control"),
  icon: sizeNames("icon"),
};
const namesTs = `export const themeNames = ${JSON.stringify(themeNames, null, 2)} as const;

export const semanticNames = ${JSON.stringify(semantic, null, 2)} as const;
`;

await mkdir(outDir, { recursive: true });
await Promise.all([
  writeFile(path.join(outDir, "theme.css"), themeCss),
  writeFile(path.join(outDir, "utilities.css"), utilitiesCss),
  writeFile(path.join(outDir, "theme-names.ts"), namesTs),
  rm(path.join(outDir, "typography.css"), { force: true }),
]);
console.log(`Wrote ${themed.length} theme variables, ${dark.length} dark overrides, ${typography.length} text styles to src/generated`);
