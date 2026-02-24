#!/usr/bin/env bash
# Run Alembic migrations using Railway's DATABASE_URL.
# Prereqs: railway CLI installed, logged in (railway login), project linked (railway link).
# Usage: from repo root: ./api/scripts/run_migrations_railway.sh
#        or from api/:   ./scripts/run_migrations_railway.sh
# Optional: pass API service name, e.g. ./api/scripts/run_migrations_railway.sh api

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
API_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$API_DIR"
SERVICE="${1:-}"
if [ -n "$SERVICE" ]; then
  railway run -s "$SERVICE" -- alembic upgrade head
else
  railway run -- alembic upgrade head
fi
