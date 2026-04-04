#!/usr/bin/env bash
# Statis Dogfood Bootstrap
# Registers agents, applies policies, and verifies via simulate.
# Idempotent — safe to run multiple times.
#
# Usage:
#   STATIS_API_KEY=st_... STATIS_BASE_URL=https://statis-core.onrender.com ./dogfood/bootstrap.sh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BASE="${STATIS_BASE_URL:-https://statis-core.onrender.com}"
KEY="${STATIS_API_KEY:?Set STATIS_API_KEY}"
AUTH="X-API-Key: $KEY"

echo "=== Registering agents ==="
jq -c '.[]' "$SCRIPT_DIR/agents.json" | while IFS= read -r agent; do
  id=$(echo "$agent" | jq -r '.agent_id')
  printf "  + %-22s " "$id"
  curl -s -X POST "$BASE/agents" \
    -H "$AUTH" \
    -H "Content-Type: application/json" \
    -d "$agent" | jq -r '.agent_id // .detail'
done

echo ""
echo "=== Applying policies ==="
# Use the SDK CLI — install if not on PATH
if ! command -v statis &>/dev/null; then
  echo "  Installing statis CLI from SDK..."
  pip install -e "$SCRIPT_DIR/../sdk" -q 2>/dev/null
fi
STATIS_BASE_URL="$BASE" STATIS_API_KEY="$KEY" statis apply "$SCRIPT_DIR/policies.yaml"

echo ""
echo "=== Verifying with simulate ==="
simulate() {
  local label="$1"
  local body="$2"
  printf "  %-45s -> " "$label"
  curl -s -X POST "$BASE/actions/simulate" \
    -H "$AUTH" \
    -H "Content-Type: application/json" \
    -d "$body" | jq -r '.decision'
}

simulate "merge (CI passed, 1 approval)" \
  '{"action_type":"github_merge_pr","entity_state":{"ci_status":"passed","approvals":1}}'

simulate "merge (no CI)" \
  '{"action_type":"github_merge_pr","entity_state":{}}'

simulate "deploy staging" \
  '{"action_type":"github_trigger_workflow","parameters":{"environment":"staging"}}'

simulate "deploy production" \
  '{"action_type":"github_trigger_workflow","parameters":{"environment":"production"}}'

simulate "deploy unknown env" \
  '{"action_type":"github_trigger_workflow","parameters":{"environment":"canary"}}'

simulate "create release (operator_approved)" \
  '{"action_type":"github_create_release","context":{"operator_approved":true}}'

simulate "create release (no approval)" \
  '{"action_type":"github_create_release"}'

simulate "slack notify" \
  '{"action_type":"slack_send_message"}'

simulate "linear create issue" \
  '{"action_type":"linear_create_issue"}'

echo ""
echo "=== Expected results ==="
echo "  merge (CI passed, 1 approval)                -> APPROVED"
echo "  merge (no CI)                                 -> ESCALATED"
echo "  deploy staging                                -> APPROVED"
echo "  deploy production                             -> ESCALATED"
echo "  deploy unknown env                            -> DENIED"
echo "  create release (operator_approved)            -> APPROVED"
echo "  create release (no approval)                  -> ESCALATED"
echo "  slack notify                                  -> APPROVED"
echo "  linear create issue                           -> APPROVED"
echo ""
echo "=== Done ==="
