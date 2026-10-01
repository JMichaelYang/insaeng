#!/usr/bin/env bash
set -euo pipefail

playwright=$(node -p "require('./package.json').devDependencies['@playwright/test']")
pnpm=$(node -p "require('./package.json').packageManager")

docker run --rm --ipc=host \
  -v "$PWD":/work -w /work \
  -v insaeng-snapshots-node-modules:/work/node_modules \
  -v insaeng-snapshots-next:/work/.next \
  -e CI=1 \
  "mcr.microsoft.com/playwright:v${playwright}-noble" \
  bash -c "npm install -g ${pnpm} >/dev/null \
    && pnpm install --frozen-lockfile \
    && pnpm exec playwright test --update-snapshots $*"
