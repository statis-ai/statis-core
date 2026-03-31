"""Seed the Statis sandbox environment.

Creates a sandbox tenant with a fixed demo API key and pre-seeds policy rules
and sample actions so developers can try Statis without production credentials.

The demo API key is intentionally public:
    sk_sandbox_demo_key_statis_2025

Usage:
    python scripts/seed_sandbox.py --api-url http://localhost:8000
    python scripts/seed_sandbox.py --api-url http://localhost:8000 --reset
"""

import argparse
import json
import sys
import uuid
import urllib.error
import urllib.request

SANDBOX_EMAIL = "sandbox@statis.dev"
SANDBOX_PASSWORD = "statis_sandbox_2025"
SANDBOX_API_KEY = "sk_sandbox_demo_key_statis_2025"

SANDBOX_POLICIES = [
    {
        "rule_id": "sandbox-budget-limit",
        "description": "Sandbox: deny expenses over $1000",
        "action_type": "log_expense",
        "conditions": {"rules": [{"field": "parameters.amount", "operator": "gt", "value": 1000}]},
        "decision": "DENIED",
        "priority": 100,
        "active": True,
    },
    {
        "rule_id": "sandbox-trade-size",
        "description": "Sandbox: deny trades over $500",
        "action_type": "propose_trade",
        "conditions": {"rules": [{"field": "parameters.amount", "operator": "gt", "value": 500}]},
        "decision": "DENIED",
        "priority": 100,
        "active": True,
    },
    {
        "rule_id": "sandbox-allow-all",
        "description": "Sandbox: allow all other actions",
        "action_type": "query",
        "conditions": {},
        "decision": "APPROVED",
        "priority": 1,
        "active": True,
    },
]

SAMPLE_ACTIONS = [
    {
        "action_id": f"sandbox-action-{i}",
        "proposed_by": "sandbox-agent",
        "action_type": "log_expense",
        "target_system": "log_expense",
        "target_entity": {"entity_type": "budget", "entity_id": "sandbox-budget-1"},
        "parameters": {"amount": (i + 1) * 50, "description": f"Sample expense #{i+1}"},
        "context": {},
        "mode": "shadow",
    }
    for i in range(5)
]


def _request(method: str, url: str, data: dict | None = None, api_key: str | None = None) -> tuple[int, dict]:
    payload = json.dumps(data).encode("utf-8") if data else None
    headers = {"Content-Type": "application/json"}
    if api_key:
        headers["X-API-Key"] = api_key
    req = urllib.request.Request(url, data=payload, method=method, headers=headers)
    try:
        with urllib.request.urlopen(req) as resp:
            body = resp.read()
            return resp.status, json.loads(body) if body else {}
    except urllib.error.HTTPError as e:
        body = e.read()
        return e.code, json.loads(body) if body else {}


def reset_sandbox(api_url: str, api_key: str) -> None:
    print("Resetting sandbox (not implemented via API — requires direct DB access).")
    print("Re-seeding on top of existing data.")


def seed(api_url: str) -> None:
    base = api_url.rstrip("/")

    # 1. Register sandbox user (idempotent — 409 means already exists)
    status, body = _request("POST", f"{base}/auth/register", {
        "email": SANDBOX_EMAIL,
        "password": SANDBOX_PASSWORD,
    })
    if status == 201:
        print(f"[OK]   Created sandbox user: {SANDBOX_EMAIL}")
    elif status == 409:
        print(f"[SKIP] Sandbox user already exists: {SANDBOX_EMAIL}")
    else:
        print(f"[WARN] Could not register sandbox user: HTTP {status} — {body}", file=sys.stderr)

    # 2. Login to get API key
    status, body = _request("POST", f"{base}/auth/login", {
        "email": SANDBOX_EMAIL,
        "password": SANDBOX_PASSWORD,
    })
    if status not in (200, 201):
        print(f"[ERR]  Could not log in as sandbox user: HTTP {status} — {body}", file=sys.stderr)
        print("Trying with hardcoded demo key...", file=sys.stderr)
        api_key = SANDBOX_API_KEY
    else:
        api_key = body.get("api_key", SANDBOX_API_KEY)

    # 3. Seed policy rules
    for rule in SANDBOX_POLICIES:
        status, body = _request("POST", f"{base}/policy-rules", rule, api_key=api_key)
        if status == 201:
            print(f"[OK]   Created policy rule: {rule['rule_id']}")
        elif status == 409:
            print(f"[SKIP] Policy rule already exists: {rule['rule_id']}")
        else:
            print(f"[WARN] Could not create rule '{rule['rule_id']}': HTTP {status}", file=sys.stderr)

    # 4. Seed sample actions (shadow mode — no production impact)
    for action in SAMPLE_ACTIONS:
        status, body = _request("POST", f"{base}/actions", action, api_key=api_key)
        if status == 201:
            action_id = action["action_id"]
            _request("POST", f"{base}/actions/{action_id}/evaluate", api_key=api_key)
            print(f"[OK]   Seeded action: {action_id}")
        elif status == 409:
            print(f"[SKIP] Action already exists: {action['action_id']}")
        else:
            print(f"[WARN] Could not create action '{action['action_id']}': HTTP {status}", file=sys.stderr)

    print(f"\nSandbox ready. Demo API key: {SANDBOX_API_KEY}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Seed the Statis sandbox environment.")
    parser.add_argument("--api-url", default="http://localhost:8000", help="Base API URL")
    parser.add_argument("--reset", action="store_true", help="Clear and re-seed (best-effort)")
    args = parser.parse_args()

    if args.reset:
        reset_sandbox(args.api_url, SANDBOX_API_KEY)

    seed(args.api_url)


if __name__ == "__main__":
    main()
