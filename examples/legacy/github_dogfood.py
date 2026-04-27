#!/usr/bin/env python3
# LEGACY (v0.1.x reference) — uses the propose/execute API from statis.advanced.
# v0.4.0 prefers @statis.gate. See ../discount_demo.py for the new pattern,
# or MIGRATION.md (repo root) for the full upgrade guide.
"""Statis GitHub Dogfood Demo -- audit-only policy evaluation for GitHub actions.

Demonstrates Phase 1 of the GitHub Dogfood initiative: proposing GitHub
action types (merge PR, create release, trigger workflow, close issue)
through the Statis policy engine with GenericAdapter (audit-only, no real
GitHub API calls).

Each action type is proposed via the Python SDK.  Entity state is seeded
via raw event POST so that the policy evaluator has the fields it needs
(ci_status, approvals, environment, opened_by_agent).

Usage:
    STATIS_API_KEY=<key> STATIS_BASE_URL=<url> python examples/legacy/github_dogfood.py

Prerequisites:
    pip install statis-ai   (or run from repo root to use local SDK source)
    A running Statis API server with migration 0028 applied.
"""
from __future__ import annotations

import os
import sys
from datetime import datetime, timezone

import httpx

try:
    from statis.advanced import StatisClient
except ImportError:
    # Allow running from the repo root with the local SDK source.
    _ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    sys.path.insert(0, os.path.join(_ROOT, "sdk", "src"))
    from statis.advanced import StatisClient

BASE_URL = os.getenv("STATIS_BASE_URL", "http://localhost:8000")
API_KEY = os.getenv("STATIS_API_KEY", "")

TS = datetime.now(timezone.utc).strftime("%H%M%S")

HEADERS = {"X-API-Key": API_KEY}

# Each action type uses a distinct entity so state does not bleed across demos.
ENTITIES = {
    "merge": {"entity_type": "pull_request", "entity_id": f"pr-42-{TS}"},
    "release": {"entity_type": "repository", "entity_id": "statis-ai/statis-core"},
    "workflow_staging": {"entity_type": "workflow", "entity_id": f"deploy-staging-{TS}"},
    "workflow_prod": {"entity_type": "workflow", "entity_id": f"deploy-prod-{TS}"},
}


def _sep(label: str) -> None:
    line = f"\n-- {label} " + "-" * max(0, 56 - len(label))
    print(line)


def _post_event(
    http: httpx.Client,
    entity_type: str,
    entity_id: str,
    event_id: str,
    event_type: str,
    payload: dict,
) -> None:
    body = {
        "event_id": event_id,
        "entity_type": entity_type,
        "entity_id": entity_id,
        "event_type": event_type,
        "payload": payload,
        "occurred_at": datetime.now(timezone.utc).isoformat(),
        "producer": "dogfood-demo",
        "schema_version": "1",
    }
    r = http.post(f"{BASE_URL}/events", json=body, headers=HEADERS)
    r.raise_for_status()


def _print_result(
    action_id: str,
    decision: str,
    receipt: statis.Receipt | None = None,
) -> None:
    print(f"  Action ID:  {action_id}")
    print(f"  Decision:   {decision}")
    if receipt:
        print(f"  Rule:       {receipt.rule_id} v{receipt.rule_version}")
        print(f"  Hash:       {receipt.hash}")


def main() -> None:
    if not API_KEY:
        print("ERROR: set STATIS_API_KEY before running this demo")
        sys.exit(1)

    print("=" * 60)
    print("  Statis GitHub Dogfood Demo -- Phase 1 (Audit-Only)")
    print("=" * 60)
    print(f"API:       {BASE_URL}")
    print()

    http = httpx.Client(timeout=15)

    # -- Step 0: Seed entity state via events ------------------------------
    _sep("Step 0 -- Seed entity state")

    # PR entity: CI passed, 2 approvals
    pr = ENTITIES["merge"]
    _post_event(http, pr["entity_type"], pr["entity_id"],
                f"ev-pr-ci-{TS}", "pr.ci_completed",
                {"ci_status": "passed", "approvals": 2})
    print(f"  {pr['entity_type']}/{pr['entity_id']}: ci_status=passed, approvals=2")

    # Workflow staging entity: environment=staging
    wf_s = ENTITIES["workflow_staging"]
    _post_event(http, wf_s["entity_type"], wf_s["entity_id"],
                f"ev-wf-staging-{TS}", "workflow.dispatch_requested",
                {"environment": "staging", "workflow": "deploy.yml"})
    print(f"  {wf_s['entity_type']}/{wf_s['entity_id']}: environment=staging")

    # Workflow prod entity: environment=production
    wf_p = ENTITIES["workflow_prod"]
    _post_event(http, wf_p["entity_type"], wf_p["entity_id"],
                f"ev-wf-prod-{TS}", "workflow.dispatch_requested",
                {"environment": "production", "workflow": "deploy.yml"})
    print(f"  {wf_p['entity_type']}/{wf_p['entity_id']}: environment=production")

    http.close()

    # -- Actions via SDK ---------------------------------------------------
    with StatisClient(api_key=API_KEY, base_url=BASE_URL) as client:

        # -- 1. Merge PR (ci=passed, approvals=2) -> expect APPROVED -------
        _sep("1. github_merge_pr -> expect APPROVED")

        aid_merge = f"gh-merge-{TS}"
        try:
            receipt = client.execute(
                action_type="github_merge_pr",
                target=pr,
                parameters={
                    "pr_number": 42,
                    "merge_method": "squash",
                    "head_sha": "abc123def456",
                },
                agent_id="dogfood-demo",
                target_system="github_merge_pr",
                action_id=aid_merge,
            )
            _print_result(aid_merge, receipt.decision, receipt)
        except statis.ActionEscalatedError as e:
            print(f"  Action ID:  {e.action_id}")
            print(f"  Decision:   ESCALATED (unexpected -- entity state may be missing)")
        except statis.ActionDeniedError as e:
            _print_result(aid_merge, "DENIED", e.receipt)

        # -- 2. Create Release (operator_approved) -> expect ESCALATED -----
        _sep("2. github_create_release -> expect ESCALATED")

        aid_release = f"gh-release-{TS}"
        rel = ENTITIES["release"]
        try:
            receipt = client.execute(
                action_type="github_create_release",
                target=rel,
                parameters={
                    "tag": "v0.2.0",
                    "name": "v0.2.0 -- GitHub Dogfood",
                    "draft": False,
                },
                agent_id="dogfood-demo",
                target_system="github_create_release",
                action_id=aid_release,
                context={"operator_approved": True},
            )
            _print_result(aid_release, receipt.decision, receipt)
        except statis.ActionEscalatedError as e:
            print(f"  Action ID:  {e.action_id}")
            print(f"  Decision:   ESCALATED (requires human review)")
        except statis.ActionDeniedError as e:
            _print_result(aid_release, "DENIED", e.receipt)

        # -- 3. Trigger Workflow staging -> expect APPROVED ----------------
        _sep("3. github_trigger_workflow (staging) -> expect APPROVED")

        aid_staging = f"gh-wf-staging-{TS}"
        try:
            receipt = client.execute(
                action_type="github_trigger_workflow",
                target=wf_s,
                parameters={
                    "workflow": "deploy.yml",
                    "ref": "main",
                    "environment": "staging",
                },
                agent_id="dogfood-demo",
                target_system="github_trigger_workflow",
                action_id=aid_staging,
            )
            _print_result(aid_staging, receipt.decision, receipt)
        except statis.ActionEscalatedError as e:
            print(f"  Action ID:  {e.action_id}")
            print(f"  Decision:   ESCALATED (unexpected)")
        except statis.ActionDeniedError as e:
            _print_result(aid_staging, "DENIED", e.receipt)

        # -- 4. Trigger Workflow production -> expect ESCALATED ------------
        _sep("4. github_trigger_workflow (production) -> expect ESCALATED")

        aid_prod = f"gh-wf-prod-{TS}"
        try:
            receipt = client.execute(
                action_type="github_trigger_workflow",
                target=wf_p,
                parameters={
                    "workflow": "deploy.yml",
                    "ref": "main",
                    "environment": "production",
                },
                agent_id="dogfood-demo",
                target_system="github_trigger_workflow",
                action_id=aid_prod,
            )
            _print_result(aid_prod, receipt.decision, receipt)
        except statis.ActionEscalatedError as e:
            print(f"  Action ID:  {e.action_id}")
            print(f"  Decision:   ESCALATED (production requires human review)")
        except statis.ActionDeniedError as e:
            _print_result(aid_prod, "DENIED", e.receipt)

    # -- Summary ----------------------------------------------------------
    print()
    print("=" * 60)
    print("  Demo Complete")
    print("=" * 60)
    print(f"  github_merge_pr:            {aid_merge}")
    print(f"  github_create_release:      {aid_release}")
    print(f"  github_trigger_workflow:    {aid_staging} (staging)")
    print(f"  github_trigger_workflow:    {aid_prod} (production)")
    print()


if __name__ == "__main__":
    main()
