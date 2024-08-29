#!/usr/bin/env bash

set -eou pipefail

pnpm wrangler pages deploy .vercel/output/static
