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

FRESH=$(date -u -v-2d '+%Y-%m-%dT%H:%M:%SZ' 2>/dev/null || date -u -d '-2 days' '+%Y-%m-%dT%H:%M:%SZ')

simulate "intake (T1 verified domain)" \
  "{\"action_type\":\"prospect_intake\",\"context\":{\"tier\":1,\"signal_seen_at\":\"$FRESH\",\"signal_length\":300,\"source\":\"hn\",\"company_domain\":\"acme.ai\",\"domain_verified\":true,\"is_aggregator_domain\":false,\"dnc\":false}}"

simulate "intake (T1 NO domain)" \
  "{\"action_type\":\"prospect_intake\",\"context\":{\"tier\":1,\"signal_seen_at\":\"$FRESH\",\"signal_length\":300,\"source\":\"hn\",\"company_domain\":\"\",\"domain_verified\":false,\"dnc\":false}}"

simulate "intake (T1 aggregator domain)" \
  "{\"action_type\":\"prospect_intake\",\"context\":{\"tier\":1,\"signal_seen_at\":\"$FRESH\",\"signal_length\":300,\"source\":\"hn\",\"company_domain\":\"github.com\",\"domain_verified\":true,\"is_aggregator_domain\":true,\"dnc\":false}}"

simulate "intake (T2 YC W26 verified)" \
  '{"action_type":"prospect_intake","context":{"tier":2,"company_domain":"sentrial.com","domain_verified":true,"is_aggregator_domain":false,"company_batch":"Winter 2026","dnc":false}}'

simulate "intake (T2 YC ancient batch)" \
  '{"action_type":"prospect_intake","context":{"tier":2,"company_domain":"acme.com","domain_verified":true,"is_aggregator_domain":false,"company_batch":"Winter 2018","dnc":false}}'

simulate "intake (T2 YC NO domain)" \
  '{"action_type":"prospect_intake","context":{"tier":2,"company_domain":"","domain_verified":false,"company_batch":"Winter 2026","dnc":false}}'

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

simulate "send (score 95, full fields)" \
  '{"action_type":"linkedin_send_message","context":{"icp_score":95},"parameters":{"recipient_profile":"u","message_body":"hi","recipient_name":"Alice"}}'

simulate "send (score 85, full fields)" \
  '{"action_type":"linkedin_send_message","context":{"icp_score":85},"parameters":{"recipient_profile":"u","message_body":"hi","recipient_name":"Alice"}}'

simulate "send (score 70, full fields)" \
  '{"action_type":"linkedin_send_message","context":{"icp_score":70},"parameters":{"recipient_profile":"u","message_body":"hi","recipient_name":"Alice"}}'

simulate "send (missing fields)" \
  '{"action_type":"linkedin_send_message","context":{"icp_score":95},"parameters":{}}'

simulate "sheets (score 85, full)" \
  '{"action_type":"sheets_append_row","context":{"icp_score":85},"parameters":{"prospect_name":"x","linkedin_url":"y","icp_score":85}}'

simulate "sheets (score 70, full)" \
  '{"action_type":"sheets_append_row","context":{"icp_score":70},"parameters":{"prospect_name":"x","linkedin_url":"y","icp_score":70}}'

simulate "sheets (missing fields)" \
  '{"action_type":"sheets_append_row","context":{"icp_score":85},"parameters":{}}'

simulate "intake (T2 competitor)" \
  '{"action_type":"prospect_intake","context":{"tier":2,"company_domain":"sentrial.com","domain_verified":true,"is_aggregator_domain":false,"company_batch":"Winter 2026","is_competitor":true,"dnc":false}}'

echo ""
echo "=== Expected results ==="
echo "  intake (T1 verified domain)                               -> APPROVED"
echo "  intake (T1 NO domain)                                     -> DENIED"
echo "  intake (T1 aggregator domain)                             -> DENIED"
echo "  intake (T2 YC W26 verified)                               -> APPROVED"
echo "  intake (T2 YC ancient batch)                              -> DENIED"
echo "  intake (T2 YC NO domain)                                  -> DENIED"
echo "  intake (dnc)                                              -> DENIED"
echo "  prospect_scored (any)                                     -> APPROVED"
echo "  qualified (90, role, ok)                                  -> APPROVED"
echo "  qualified (65, borderline)                                -> ESCALATED"
echo "  qualified (30)                                            -> DENIED"
echo "  qualified (90 but disqualified)                           -> DENIED"
echo "  draft (with required fields)                              -> APPROVED"
echo "  draft (missing fields)                                    -> DENIED"
echo "  send (score 95, full fields)                              -> APPROVED  (auto-execute)"
echo "  send (score 85, full fields)                              -> ESCALATED (manual review)"
echo "  send (score 70, full fields)                              -> DENIED"
echo "  send (missing fields)                                     -> DENIED"
echo "  sheets (score 85, full)                                   -> APPROVED"
echo "  sheets (score 70, full)                                   -> DENIED"
echo "  sheets (missing fields)                                   -> DENIED"
echo "  intake (T2 competitor)                                    -> DENIED"
echo ""
echo "=== Done ==="
