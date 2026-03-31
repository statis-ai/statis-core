#!/usr/bin/env bash
# Daily sandbox reset — intended for cron.
# Add to crontab: 0 0 * * * /path/to/statis-core/scripts/sandbox_reset.sh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
API_URL="${STATIS_API_URL:-http://localhost:8000}"

python "${SCRIPT_DIR}/seed_sandbox.py" --api-url "${API_URL}" --reset
