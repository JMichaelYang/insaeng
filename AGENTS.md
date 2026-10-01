# insaeng

pnpm monorepo.

- `apps/web`: the Next.js app. Read `apps/web/AGENTS.md` before changing it.
- `packages/design-system` (`@insaeng/design-system`): design tokens, Tailwind theme, and shared components. See its README.

Run `pnpm dev`, `pnpm build`, and `pnpm lint` from the repo root.

## Styling rules

- Use semantic tokens (`bg-canvas`, `text-muted`, `bg-primary`, `type-heading-lg`), not palette steps or arbitrary colors. Tailwind's default palette is disabled and lint rejects unknown classes.
- To change a token, edit `packages/design-system/tokens/*.json` and run `pnpm tokens`. Never edit `src/generated` by hand; CI fails if it is stale.
- New shared components go in the design system's `atoms/`, `molecules/`, or `organisms/`. Page layouts stay in the app.
