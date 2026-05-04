#!/usr/bin/env bash
# reset.sh — truncate demo-tenant actions, receipts, and context_log
# between recordings so the Console shows only the current run.
#
# Requires DATABASE_URL (Postgres connection string).
#
# Usage:
#   export DATABASE_URL=postgresql://...
#   bash demo/attack/reset.sh

set -euo pipefail

if [ -z "${DATABASE_URL:-}" ]; then
  echo "error: DATABASE_URL is not set" >&2
  exit 1
fi

# Prompt for the demo tenant API key prefix to scope deletes safely.
read -rp "Demo tenant_id to clean (e.g. tenant_demo_attack): " TENANT_ID

if [ -z "$TENANT_ID" ]; then
  echo "error: tenant_id required" >&2
  exit 1
fi

echo "cleaning demo state for tenant: $TENANT_ID"

psql "$DATABASE_URL" <<SQL
BEGIN;

DELETE FROM receipts
  WHERE action_id IN (
    SELECT action_id FROM action_contracts WHERE tenant_id = '${TENANT_ID}'
  );

DELETE FROM context_log
  WHERE action_id IN (
    SELECT action_id FROM action_contracts WHERE tenant_id = '${TENANT_ID}'
  );

DELETE FROM action_contracts WHERE tenant_id = '${TENANT_ID}';

-- Drop demo policy rules so renames don't leave stale duplicates.
DELETE FROM policy_rules
  WHERE tenant_id = '${TENANT_ID}'
    AND rule_id IN (
      'refund_recipient_must_match_state',
      'refund_recipient_matches_state',
      'refund_recipient_mismatch',
      'refund_to_customer_of_record'
    );

COMMIT;
SQL

echo "done — run python demo/attack/seed.py to re-seed policies, then python demo/attack/agent.py"
