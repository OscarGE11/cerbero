#!/usr/bin/env bash
set -euo pipefail

cleanup() {
  echo ""
  echo "Cerrando API y dashboard…"
  kill 0 2>/dev/null || true
  exit 0
}

trap cleanup SIGINT SIGTERM

if ! bun scripts/check-env.ts; then
  echo ""
  echo "Corrige el .env antes de arrancar (ver: bun run env:print)"
  exit 1
fi

echo "Cerbero — API :3001 + Dashboard :3000"
echo "Ctrl+C para detener ambos"
echo ""

bun --env-file=.env run --filter @cerbero/api dev &
bun --env-file=.env run --filter @cerbero/dashboard dev &

wait
