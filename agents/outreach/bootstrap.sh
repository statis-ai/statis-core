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

simulate "intake (fresh, long, hn)" \
  "{\"action_type\":\"prospect_intake\",\"context\":{\"signal_seen_at\":\"$(date -u -v-2d '+%Y-%m-%dT%H:%M:%SZ' 2>/dev/null || date -u -d '-2 days' '+%Y-%m-%dT%H:%M:%SZ')\",\"signal_length\":300,\"source\":\"hn\",\"dnc\":false}}"

simulate "intake (stale)" \
  "{\"action_type\":\"prospect_intake\",\"context\":{\"signal_seen_at\":\"$(date -u -v-30d '+%Y-%m-%dT%H:%M:%SZ' 2>/dev/null || date -u -d '-30 days' '+%Y-%m-%dT%H:%M:%SZ')\",\"signal_length\":300,\"source\":\"hn\",\"dnc\":false}}"

simulate "intake (too short)" \
  "{\"action_type\":\"prospect_intake\",\"context\":{\"signal_seen_at\":\"$(date -u -v-2d '+%Y-%m-%dT%H:%M:%SZ' 2>/dev/null || date -u -d '-2 days' '+%Y-%m-%dT%H:%M:%SZ')\",\"signal_length\":50,\"source\":\"hn\",\"dnc\":false}}"

simulate "intake (off-source)" \
  "{\"action_type\":\"prospect_intake\",\"context\":{\"signal_seen_at\":\"$(date -u -v-2d '+%Y-%m-%dT%H:%M:%SZ' 2>/dev/null || date -u -d '-2 days' '+%Y-%m-%dT%H:%M:%SZ')\",\"signal_length\":300,\"source\":\"twitter\",\"dnc\":false}}"

simulate "intake (dnc)" \
  '{"action_type":"prospect_intake","context":{"dnc":true}}'

simulate "prospect_scored (any)" \
  '{"action_type":"prospect_scored"}'

simulate "qualified (90, role, ok)" \
  '{"action_type":"prospect_qualified","context":{"icp_score":90,"inferred_role":"Founding Eng","disqualified":false}}'

simulate "qualified (65, borderline)" \
  '{"action_type":"prospect_qualified","context":{"icp_score":65,"inferred_role":"Eng","disqualified":false}}'

simulate "qualified (30)" \
  '{"action_type":"prospect_qualified","context":{"icp_score":30,"inferred_role":null,"disqualified":false}}'

simulate "qualified (90 but disqualified)" \
  '{"action_type":"prospect_qualified","context":{"icp_score":90,"inferred_role":"CTO","disqualified":true}}'

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
echo "  intake (fresh, long, hn)                                  -> APPROVED"
echo "  intake (stale)                                            -> DENIED"
echo "  intake (too short)                                        -> DENIED"
echo "  intake (off-source)                                       -> DENIED"
echo "  intake (dnc)                                              -> DENIED"
echo "  prospect_scored (any)                                     -> APPROVED"
echo "  qualified (90, role, ok)                                  -> APPROVED"
echo "  qualified (65, borderline)                                -> ESCALATED"
echo "  qualified (30)                                            -> DENIED"
echo "  qualified (90 but disqualified)                           -> DENIED"
echo "  draft (with required fields)                              -> APPROVED"
echo "  draft (missing fields)                                    -> DENIED"
echo "  send (with required fields)                               -> ESCALATED"
echo "  send (missing fields)                                     -> DENIED"
echo "  sheets_append_row (full)                                  -> APPROVED"
echo "  sheets_append_row (missing fields)                        -> DENIED"
echo ""
echo "=== Done ==="
