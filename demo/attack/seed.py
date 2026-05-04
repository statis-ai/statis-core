"""Idempotent seeder for the attack demo.

Creates the policy rule needed for the demo. Safe to run multiple times:
a 409 (rule already exists) is treated as success.

Usage:
    export STATIS_API_KEY=st_...
    export STATIS_BASE_URL=https://api.statis.dev   # or http://localhost:8000
    python demo/attack/seed.py
"""
from __future__ import annotations

import json
import os
import sys
import urllib.request

from ticket_fixture import POLICY_RULE_APPROVE, POLICY_RULE_DENY


def _post(url: str, api_key: str, body: dict) -> tuple[int, dict]:
    data = json.dumps(body).encode()
    req = urllib.request.Request(
        url,
        data=data,
        headers={
            "Content-Type": "application/json",
            "x-api-key": api_key,
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status, json.loads(resp.read())
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read() or b"{}")


def main() -> None:
    api_key = os.environ.get("STATIS_API_KEY", "")
    base_url = os.environ.get("STATIS_BASE_URL", "https://api.statis.dev").rstrip("/")

    if not api_key:
        print("error: STATIS_API_KEY is not set", file=sys.stderr)
        sys.exit(1)

    print(f"seeding demo policy rules → {base_url}")

    for rule in [POLICY_RULE_APPROVE, POLICY_RULE_DENY]:
        status, resp = _post(f"{base_url}/policy-rules", api_key, rule)
        if status == 201:
            print(f"  created: {rule['rule_id']} ({rule['decision']})")
        elif status == 409:
            print(f"  already exists: {rule['rule_id']} (ok)")
        else:
            print(f"  error {status}: {resp}", file=sys.stderr)
            sys.exit(1)

    print("seed complete")


if __name__ == "__main__":
    main()
