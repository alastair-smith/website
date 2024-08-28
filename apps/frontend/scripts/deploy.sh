#!/usr/bin/env bash

set -eou pipefail

pnpm wrangler pages deploy .vercel/output/static \
  --project-name website-frontend \
  --custom-entrypoint=./src/cloudflare-entrypoint.ts \
  --var "GIT_BRANCH_NAME:$GIT_BRANCH_NAME" \
  --var "ENVIRONMENT:$ENVIRONMENT" \
  --var "NEW_RELIC_LICENSE_KEY:$NEW_RELIC_LICENSE_KEY" \
  --var "VERSION:$VERSION"
