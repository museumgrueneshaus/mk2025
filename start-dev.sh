#!/usr/bin/env bash
set -euo pipefail

echo "Starting Sanity Studio (http://localhost:3333) and Astro (http://localhost:4321)..."
echo "Tip: If this is your first run, open a separate terminal and run: (cd museum-sanity-backend && npx sanity login)"

cleanup() {
  echo "\nShutting down dev servers..."
  [[ -n "${SANITY_PID:-}" ]] && kill ${SANITY_PID} 2>/dev/null || true
  [[ -n "${ASTRO_PID:-}" ]] && kill ${ASTRO_PID} 2>/dev/null || true
}
trap cleanup EXIT INT TERM

(cd museum-sanity-backend && npm run dev) & SANITY_PID=$!
(cd museum-astro-frontend && npm run dev) & ASTRO_PID=$!

wait

