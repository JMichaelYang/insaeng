# insaeng

pnpm monorepo.

- `apps/web`: the Next.js app. Read `apps/web/AGENTS.md` before changing it.
- `packages/design-system` (`@insaeng/design-system`): design tokens, Tailwind theme, and shared components.

Run `pnpm dev`, `pnpm build`, and `pnpm lint` from the repo root.

## Code rules

- NO CODE COMMENTS. Do not add comments to code, including generated code.

## Styling rules

- Colors follow Material 3 roles: `bg-surface`, `bg-surface-container-*`, `text-on-surface`, `text-on-surface-variant`, `border-outline`, `bg-primary` + `text-on-primary`, `bg-secondary-container` + `text-on-secondary-container`. Warning, success, and info follow the same pattern as error. Palette steps are not utilities.
- Use the `state-layer` utility for hover, focus, and pressed states instead of hover colors.
- Spacing is a strict scale: `0`, `px`, `0.5`, `1`, `2`, `3`, `4`, `5`, `6`, `8`, `10`, `12`, `16`, `20`, `24`, `32`. It applies to padding, margin, gap, inset, width, and height. Use `h-control-*` for control heights and `size-icon-*` for icons.
- Lint rejects any class that is not backed by a token.
- To change a token, edit `packages/design-system/tokens/*.json` and run `pnpm tokens`. Never edit `src/generated` by hand; CI fails if it is stale.
- New shared components go in the design system's `atoms/`, `molecules/`, or `organisms/`. Page layouts stay in the app.
