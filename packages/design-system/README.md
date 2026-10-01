# @insaeng/design-system

Design tokens, the Tailwind v4 theme generated from them, and shared React components.

## Using it in an app

```css
/* app/globals.css: replaces @import "tailwindcss" */
@import "@insaeng/design-system/tailwind.css";
```

```tsx
// app/layout.tsx
import "@insaeng/design-system/fonts.css"; // Pretendard
```

The app also loads Geist Mono (`--font-geist-mono`) and Pochaevsk (`--font-pochaevsk`, from `assets/fonts`) with `next/font`; see `apps/web/app/layout.tsx`.

## Tokens

Tokens are [W3C DTCG](https://www.designtokens.org/) JSON in `tokens/`. `pnpm tokens` runs Style Dictionary and writes `src/generated/` (committed; CI checks it is current).

| File | Contents |
| --- | --- |
| `color/palette.json` | Primitive 50–950 scales: `primary` (sage), `secondary` (teal), `tertiary` (clay), `neutral` (slate), `red`, `amber`, `green`, `blue` |
| `color/light.json`, `color/dark.json` | Semantic colors; same names, per-theme values |
| `typography.json` | Font families, weights, sizes, line heights, letter spacing, composite text styles |
| `space.json` | Spacing base and semantic spacing, control/icon sizes, containers, breakpoints |
| `effects.json` | Radius, border width, shadow, opacity, duration, easing, z-index |

Components should use semantic tokens. Palette steps exist for the rare case nothing semantic fits.

| Token | Tailwind | Example |
| --- | --- | --- |
| `color.bg.*` | `bg-{name}` | `bg-canvas`, `bg-surface`, `bg-surface-sunken` |
| `color.text.*` | `text-{name}` | `text-strong`, `text-default`, `text-muted`, `text-link` |
| `color.border.*` | `border-{name}` | `border-subtle`, `border-strong` (use for inputs) |
| `color.{role}.*` | any color utility | `bg-primary`, `hover:bg-primary-hover`, `text-on-primary`, `bg-danger-subtle` |
| `typography.*` | `type-{name}` | `type-heading-lg`, `type-body-md`, `type-label` |
| `spacing.{inset,stack,inline}.*` | spacing utilities | `p-inset-md`, `gap-stack-lg`, `gap-inline-sm` |
| `size.control.*`, `size.icon.*` | sizing utilities | `h-control-md`, `size-icon-sm` |
| `duration.*`, `easing.*`, `z-index.*` | | `duration-fast`, `ease-standard`, `z-modal` |

Roles are `primary`, `secondary`, `tertiary`, `danger`, `warning`, `success`, `info`, and `disabled`. Each has `{role}`, `on-{role}`, `{role}-subtle`, and `on-{role}-subtle`; brand roles add `-hover`/`-active`, status roles add `-border`. Every `on-*` pair meets WCAG AA in both themes.

Tailwind's default color, font, type, radius, shadow, easing, container, and breakpoint scales are cleared, so only these tokens exist. The 4px spacing multiplier (`p-4`, `gap-2`) is kept.

### Dark mode

Dark values apply when the OS prefers dark, unless `<html data-theme="light">` is set; `data-theme="dark"` forces dark. The `dark:` variant follows the same rule. Semantic tokens switch automatically, so components rarely need `dark:`.

## Components

`src/atoms`, `src/molecules`, and `src/organisms` follow atomic design and are empty for now. Export new components from each folder's `index.ts`. Use `cn()` from the package root to merge class names; it knows the token names.
