#!/usr/bin/env bash
set -euo pipefail

root=$(cd "$(dirname "$0")/../../.." && pwd)
playwright=$(node -p "require('${root}/apps/web/package.json').devDependencies['@playwright/test']")
pnpm=$(node -p "require('${root}/package.json').packageManager")

docker run --rm --ipc=host \
  -v "$root":/work -w /work \
  -v insaeng-snapshots-node-modules:/work/node_modules \
  -v insaeng-snapshots-web-node-modules:/work/apps/web/node_modules \
  -v insaeng-snapshots-ds-node-modules:/work/packages/design-system/node_modules \
  -v insaeng-snapshots-next:/work/apps/web/.next \
  -e CI=1 \
  "mcr.microsoft.com/playwright:v${playwright}-noble" \
  bash -c "npm install -g ${pnpm} >/dev/null \
    && pnpm install --frozen-lockfile \
    && pnpm --filter web exec playwright test --update-snapshots $*"
