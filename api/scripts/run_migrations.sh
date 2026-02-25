#!/usr/bin/env bash
# Run Alembic migrations using DATABASE_URL from the environment.
# Usage: DATABASE_URL='postgresql://...' ./api/scripts/run_migrations.sh
#        or from api/:  DATABASE_URL='postgresql://...' ./scripts/run_migrations.sh

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
API_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$API_DIR"

if [ -z "$DATABASE_URL" ]; then
  echo "Error: DATABASE_URL is not set." >&2
  exit 1
fi

alembic upgrade head
