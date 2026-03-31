"""Seed preset policy rules into Statis via the API.

Inserts pre-defined rule sets without requiring raw SQL access.
Idempotent: rules that already exist (409 Conflict) are skipped.

Usage:
    python scripts/seed_policies.py --api-key sk-xxx --preset fintech
    python scripts/seed_policies.py --api-key sk-xxx --preset crm --api-url https://api.statis.dev
    python scripts/seed_policies.py --api-key sk-xxx --preset default
"""

import argparse
import json
import sys
import urllib.error
import urllib.request

# ---------------------------------------------------------------------------
# Presets
# Each rule uses the API field names:
#   rule_id, action_type, conditions (dict), decision, priority, active, description
#
# conditions is stored as JSONB (dict) in the DB.
# Multi-condition rules use {"rules": [...]} envelope.
# Rules with no conditions use {}.
# ---------------------------------------------------------------------------

FINTECH_RULES = [
    {
        "rule_id": "block-large-charges",
        "description": "Deny charges above $10,000 without escalation",
        "action_type": "charge_customer",
        "conditions": {"rules": [{"field": "parameters.amount", "operator": "gt", "value": 10000}]},
        "decision": "ESCALATE",
        "priority": 100,
        "active": True,
    },
    {
        "rule_id": "budget-remaining-check",
        "description": "Deny if budget_remaining falls below minimum threshold",
        "action_type": "log_expense",
        "conditions": {"rules": [{"field": "context.budget_remaining", "operator": "lt", "value": 100}]},
        "decision": "DENIED",
        "priority": 90,
        "active": True,
    },
    {
        "rule_id": "max-trade-size",
        "description": "Deny trades above max allowed size",
        "action_type": "propose_trade",
        "conditions": {"rules": [{"field": "parameters.amount", "operator": "gt", "value": 50000}]},
        "decision": "DENIED",
        "priority": 100,
        "active": True,
    },
    {
        "rule_id": "allow-standard-charges",
        "description": "Allow standard charges below threshold",
        "action_type": "charge_customer",
        "conditions": {},
        "decision": "APPROVED",
        "priority": 10,
        "active": True,
    },
]

CRM_RULES = [
    {
        "rule_id": "block-bulk-contact-delete",
        "description": "Deny bulk contact deletions (more than 10 at once)",
        "action_type": "delete_contact",
        "conditions": {"rules": [{"field": "parameters.count", "operator": "gt", "value": 10}]},
        "decision": "DENIED",
        "priority": 100,
        "active": True,
    },
    {
        "rule_id": "escalate-opportunity-close",
        "description": "Escalate opportunity close/won actions for human review",
        "action_type": "close_opportunity",
        "conditions": {},
        "decision": "ESCALATE",
        "priority": 100,
        "active": True,
    },
    {
        "rule_id": "allow-contact-updates",
        "description": "Allow standard contact update operations",
        "action_type": "update_contact",
        "conditions": {},
        "decision": "APPROVED",
        "priority": 10,
        "active": True,
    },
]

DEFAULT_RULES = [
    {
        "rule_id": "deny-unknown-action-types",
        "description": "Deny action types not explicitly allowed by other rules",
        "action_type": "__unknown__",
        "conditions": {},
        "decision": "DENIED",
        "priority": 1,
        "active": True,
    },
    {
        "rule_id": "allow-readonly-actions",
        "description": "Allow read-only query actions",
        "action_type": "query",
        "conditions": {},
        "decision": "APPROVED",
        "priority": 50,
        "active": True,
    },
]

PRESETS = {
    "fintech": FINTECH_RULES,
    "crm": CRM_RULES,
    "default": DEFAULT_RULES,
}


def post_rule(api_url: str, api_key: str, rule: dict) -> tuple[int, dict]:
    url = f"{api_url.rstrip('/')}/policy-rules"
    payload = json.dumps(rule).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=payload,
        method="POST",
        headers={
            "Content-Type": "application/json",
            "X-API-Key": api_key,
        },
    )
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status, json.loads(resp.read())
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read())


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Seed preset policy rules into Statis via the API.",
        epilog=(
            "Examples:\n"
            "  python scripts/seed_policies.py --api-key sk-xxx --preset fintech\n"
            "  python scripts/seed_policies.py --api-key sk-xxx --preset crm --api-url https://api.statis.dev"
        ),
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument("--api-key", required=True, help="Statis API key")
    parser.add_argument(
        "--preset",
        required=True,
        choices=list(PRESETS.keys()),
        help="Rule preset to seed: fintech, crm, or default",
    )
    parser.add_argument(
        "--api-url",
        default="http://localhost:8000",
        help="Base API URL (default: http://localhost:8000)",
    )
    args = parser.parse_args()

    rules = PRESETS[args.preset]
    errors = []

    for rule in rules:
        status, body = post_rule(args.api_url, args.api_key, rule)
        rule_id = rule["rule_id"]
        if status == 201:
            print(f"[OK]   Created rule: {rule_id}")
        elif status == 409:
            print(f"[SKIP] Rule already exists: {rule_id}")
        else:
            msg = body.get("detail", body)
            print(f"[ERR]  Failed to create rule '{rule_id}': HTTP {status} — {msg}", file=sys.stderr)
            errors.append(rule_id)

    if errors:
        print(f"\n{len(errors)} rule(s) failed to seed.", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
