"""Statis CLI — agent governance for production AI agents.

Usage:
    statis init                                  Set up your Statis workspace
    statis apply policies.yaml                   Upsert policy rules from a YAML file
    statis diff policies.yaml                    Show what would change without writing
    statis simulate --action-type X ...          Dry-run policy evaluation

Environment variables (override saved config):
    STATIS_API_KEY     Your API key (set by statis init, or export manually)
    STATIS_BASE_URL    Defaults to https://api.statis.dev
"""
from __future__ import annotations

import argparse
import getpass
import json
import os
import sys
from typing import Any

import httpx
import yaml  # type: ignore[import]

from . import _config


def _client() -> httpx.Client:
    api_key = _config.get_api_key()
    base_url = _config.get_base_url().rstrip("/")
    if not api_key:
        sys.exit(
            "Error: no API key found.\n"
            "  Run `statis init` to create or log in to your workspace.\n"
            "  Or set the STATIS_API_KEY environment variable."
        )
    return httpx.Client(
        base_url=base_url,
        headers={"X-API-Key": api_key},
        timeout=30.0,
    )


def _load_yaml(path: str) -> list[dict[str, Any]]:
    with open(path) as f:
        doc = yaml.safe_load(f)
    if not isinstance(doc, dict) or "rules" not in doc:
        sys.exit(f"Error: {path} must be a YAML file with a top-level 'rules' list.")
    rules = doc["rules"]
    if not isinstance(rules, list):
        sys.exit("Error: 'rules' must be a list.")
    return rules


def _fetch_existing(client: httpx.Client) -> dict[str, dict]:
    resp = client.get("/policy-rules")
    if not resp.is_success:
        sys.exit(f"Error fetching existing rules: {resp.status_code} {resp.text}")
    return {r["rule_id"]: r for r in resp.json()}


def _upsert_rule(client: httpx.Client, rule: dict[str, Any], existing: dict) -> str:
    """Returns 'created', 'updated', or 'unchanged'."""
    rule_id = rule["rule_id"]
    payload = {
        "rule_id": rule_id,
        "action_type": rule["action_type"],
        "conditions": rule.get("conditions", {}),
        "decision": rule["decision"],
        "priority": rule.get("priority", 0),
        "active": rule.get("active", True),
        "description": rule.get("description"),
    }

    if rule_id not in existing:
        resp = client.post("/policy-rules", json=payload)
        if not resp.is_success:
            sys.exit(f"Error creating rule '{rule_id}': {resp.status_code} {resp.text}")
        return "created"

    # Check if anything changed
    ex = existing[rule_id]
    changed = (
        payload["action_type"] != ex.get("action_type")
        or payload["conditions"] != ex.get("conditions")
        or payload["decision"] != ex.get("decision")
        or payload["priority"] != ex.get("priority")
        or payload["active"] != ex.get("active")
        or payload["description"] != ex.get("description")
    )
    if not changed:
        return "unchanged"

    update_payload = {k: v for k, v in payload.items() if k != "rule_id"}
    resp = client.put(f"/policy-rules/{rule_id}", json=update_payload)
    if not resp.is_success:
        sys.exit(f"Error updating rule '{rule_id}': {resp.status_code} {resp.text}")
    return "updated"


def cmd_apply(args: argparse.Namespace) -> None:
    rules = _load_yaml(args.file)
    client = _client()
    existing = _fetch_existing(client)

    counts = {"created": 0, "updated": 0, "unchanged": 0}
    for rule in rules:
        outcome = _upsert_rule(client, rule, existing)
        counts[outcome] += 1
        symbol = {"created": "+", "updated": "~", "unchanged": " "}[outcome]
        print(f"  [{symbol}] {rule['rule_id']} ({outcome})")

    print(
        f"\nApplied {len(rules)} rule(s): "
        f"{counts['created']} created, {counts['updated']} updated, "
        f"{counts['unchanged']} unchanged."
    )


def cmd_diff(args: argparse.Namespace) -> None:
    rules = _load_yaml(args.file)
    client = _client()
    existing = _fetch_existing(client)

    has_diff = False
    for rule in rules:
        rule_id = rule["rule_id"]
        if rule_id not in existing:
            print(f"  [+] {rule_id}  (new)")
            has_diff = True
        else:
            ex = existing[rule_id]
            diffs = []
            for field in ("action_type", "decision", "priority", "active", "description"):
                local = rule.get(field)
                remote = ex.get(field)
                if local != remote:
                    diffs.append(f"{field}: {remote!r} → {local!r}")
            cond_local = rule.get("conditions", {})
            cond_remote = ex.get("conditions", {})
            if cond_local != cond_remote:
                diffs.append("conditions changed")
            if diffs:
                print(f"  [~] {rule_id}")
                for d in diffs:
                    print(f"        {d}")
                has_diff = True
            else:
                print(f"  [ ] {rule_id}  (unchanged)")

    if not has_diff:
        print("No changes.")


def cmd_simulate(args: argparse.Namespace) -> None:
    entity_state: dict[str, Any] = {}
    parameters: dict[str, Any] = {}

    if args.entity_state:
        with open(args.entity_state) as f:
            entity_state = json.load(f)

    if args.parameters:
        with open(args.parameters) as f:
            parameters = json.load(f)

    client = _client()
    resp = client.post(
        "/actions/simulate",
        json={
            "action_type": args.action_type,
            "entity_state": entity_state,
            "parameters": parameters,
        },
    )
    if not resp.is_success:
        sys.exit(f"Simulation failed: {resp.status_code} {resp.text}")

    data = resp.json()
    decision = data["decision"]
    rule_id = data.get("rule_id") or "—"
    reason = data.get("reason", "")

    symbol = {
        "APPROVED": "✓",
        "DENIED": "✗",
        "ESCALATED": "?",
        "STEP_UP": "?",
        "DEFERRED": "~",
        "MODIFIED": "±",
    }.get(decision, "?")
    print(f"\n  {symbol}  {decision}")
    print(f"     rule:   {rule_id}")
    print(f"     reason: {reason}\n")


def cmd_init(args: argparse.Namespace) -> None:
    base_url = _config.get_base_url().rstrip("/")

    # Already configured — short-circuit unless --force
    existing = _config.load()
    if existing.get("api_key") and not args.force:
        print(
            f"Already initialised — tenant {existing.get('tenant_id', '?')}.\n"
            f"Config: {_config.config_path()}\n"
            f"Run `statis init --force` to re-authenticate."
        )
        return

    print("Welcome to Statis — agent governance for production AI agents.\n")

    # Choose signup vs login
    try:
        new_user_raw = input("New user? [Y/n]: ").strip().lower()
    except (EOFError, KeyboardInterrupt):
        print("\nAborted.")
        sys.exit(0)
    is_new = new_user_raw in ("", "y", "yes")

    try:
        email = input("Email: ").strip()
        if not email:
            sys.exit("Error: email is required.")
        password = getpass.getpass("Password: ")
        if not password:
            sys.exit("Error: password is required.")
        project_name = None
        if is_new:
            project_name = input("Project name (e.g. My Agent): ").strip() or "My Project"
    except (EOFError, KeyboardInterrupt):
        print("\nAborted.")
        sys.exit(0)

    endpoint = f"{base_url}/admin/{'signup' if is_new else 'login'}"
    payload: dict[str, Any] = {"email": email, "password": password}
    if is_new:
        payload["project_name"] = project_name

    try:
        resp = httpx.post(endpoint, json=payload, timeout=15.0)
    except httpx.ConnectError:
        sys.exit(f"Error: could not connect to {base_url}. Is the API reachable?")

    if resp.status_code == 409:
        sys.exit("Error: an account with that email already exists. Use 'statis init' and answer 'n' to sign in.")
    if resp.status_code == 401:
        sys.exit("Error: invalid email or password.")
    if not resp.is_success:
        sys.exit(f"Error: {resp.status_code} {resp.text}")

    data = resp.json()
    api_key = data["api_key"]
    tenant_id = data["tenant_id"]

    _config.save(api_key=api_key, tenant_id=tenant_id, base_url=base_url)

    action = "Workspace created" if is_new else "Signed in"
    print(f"\n✓ {action} — {tenant_id}")
    print(f"✓ API key saved to {_config.config_path()}")
    print(
        f"\nAll set. Try:\n"
        f"  STATIS_BASE_URL=mock:// python -c \""
        f"from statis import gate; "
        f"@gate('hello'); f=lambda: print('ready'); f()\""
    )
    print("\nDocs: https://docs.statis.dev")


def main() -> None:
    parser = argparse.ArgumentParser(
        prog="statis",
        description="Statis CLI — agent governance for production AI agents",
    )
    sub = parser.add_subparsers(dest="command", required=True)

    p_init = sub.add_parser("init", help="Create or sign in to your Statis workspace")
    p_init.add_argument("--force", action="store_true", help="Re-authenticate even if already configured")

    p_apply = sub.add_parser("apply", help="Upsert policy rules from a YAML file")
    p_apply.add_argument("file", help="Path to policies YAML file")

    p_diff = sub.add_parser("diff", help="Show what would change without writing")
    p_diff.add_argument("file", help="Path to policies YAML file")

    p_sim = sub.add_parser("simulate", help="Dry-run policy evaluation")
    p_sim.add_argument("--action-type", required=True, help="Action type to simulate")
    p_sim.add_argument("--entity-state", help="Path to entity state JSON file")
    p_sim.add_argument("--parameters", help="Path to parameters JSON file")

    args = parser.parse_args()

    if args.command == "init":
        cmd_init(args)
    elif args.command == "apply":
        cmd_apply(args)
    elif args.command == "diff":
        cmd_diff(args)
    elif args.command == "simulate":
        cmd_simulate(args)


if __name__ == "__main__":
    main()
