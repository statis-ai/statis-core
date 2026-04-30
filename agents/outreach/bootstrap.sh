#!/usr/bin/env bash
# Statis Outreach Agent Bootstrap
# Registers the agent + applies policies. Idempotent.
#
# Usage:
#   STATIS_API_KEY=st_... STATIS_BASE_URL=https://statis-core.onrender.com ./agents/outreach/bootstrap.sh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BASE="${STATIS_BASE_URL:-https://statis-core.onrender.com}"
KEY="${STATIS_API_KEY:?Set STATIS_API_KEY}"
AUTH="X-API-Key: $KEY"

echo "=== Registering outreach agent ==="
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
if ! command -v statis &>/dev/null; then
  echo "  Installing statis CLI from local SDK..."
  pip install -e "$SCRIPT_DIR/../../sdk" -q 2>/dev/null || pip install -e "$SCRIPT_DIR/../../sdk" -q --break-system-packages 2>/dev/null
fi
STATIS_BASE_URL="$BASE" STATIS_API_KEY="$KEY" statis apply "$SCRIPT_DIR/policies.yaml"

echo ""
echo "=== Verifying with simulate ==="
simulate() {
  local label="$1"
  local body="$2"
  printf "  %-55s -> " "$label"
  curl -s -X POST "$BASE/actions/simulate" \
    -H "$AUTH" \
    -H "Content-Type: application/json" \
    -d "$body" | jq -r '.decision'
}

simulate "prospect_scored (any)" \
  '{"action_type":"prospect_scored"}'

simulate "draft (with required fields)" \
  '{"action_type":"outreach_draft_message","parameters":{"message_body":"hi","signal_url":"https://x","channel":"linkedin"}}'

simulate "draft (missing fields)" \
  '{"action_type":"outreach_draft_message","parameters":{"message_body":"hi"}}'

simulate "send (with required fields)" \
  '{"action_type":"linkedin_send_message","parameters":{"recipient_profile":"u","message_body":"hi","recipient_name":"Alice"}}'

simulate "send (missing fields)" \
  '{"action_type":"linkedin_send_message","parameters":{}}'

simulate "sheets_append_row (full)" \
  '{"action_type":"sheets_append_row","parameters":{"prospect_name":"x","linkedin_url":"y","icp_score":75}}'

simulate "sheets_append_row (missing fields)" \
  '{"action_type":"sheets_append_row","parameters":{}}'

echo ""
echo "=== Expected results ==="
echo "  prospect_scored (any)                                    -> APPROVED"
echo "  draft (with required fields)                              -> APPROVED"
echo "  draft (missing fields)                                    -> DENIED"
echo "  send (with required fields)                               -> ESCALATED"
echo "  send (missing fields)                                     -> DENIED"
echo "  sheets_append_row (full)                                  -> APPROVED"
echo "  sheets_append_row (missing fields)                        -> DENIED"
echo ""
echo "=== Done ==="
