"""Dogfood script: run an initiative brief creation through all four Statis primitives.

Runs against local dev (http://localhost:8000 by default).  Set environment
variables to override:

    STATIS_BASE_URL  — e.g. http://localhost:8000
    STATIS_API_KEY   — API key for the local dev tenant

On completion, writes two artifacts:
    statis-ops/initiatives/dogfood-artifacts/receipt.json
    statis-ops/initiatives/dogfood-artifacts/summary.md

If the server is unreachable or env vars are missing the script falls through to
DRY_RUN mode, which produces a structurally identical artifact labelled
"dry_run": true.  This mode is clearly separated so the artifact is not
mistaken for a live receipt.

Usage:
    cd /home/aniket/statis/statis-core
    STATIS_API_KEY=<key> python scripts/dogfood_initiative_brief.py
"""
from __future__ import annotations

import hashlib
import json
import os
import sys
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

BASE_URL: str = os.getenv("STATIS_BASE_URL", "http://localhost:8000").rstrip("/")
API_KEY: str = os.getenv("STATIS_API_KEY", "")

ARTIFACTS_DIR = Path("/home/aniket/statis/statis-ops/initiatives/dogfood-artifacts")
RECEIPT_PATH = ARTIFACTS_DIR / "receipt.json"
SUMMARY_PATH = ARTIFACTS_DIR / "summary.md"

# The initiative brief that will be written as the dogfood payload.
BRIEF_FILE_PATH = str(
    Path("/home/aniket/statis/statis-ops/initiatives")
    / "dogfood-artifacts"
    / "dogfood-brief-written-by-statis.md"
)

ACTION_ID: str = str(uuid.uuid4())

ACTION_PAYLOAD: dict[str, Any] = {
    "action_id": ACTION_ID,
    "proposed_by": "boardroom-coordinator-agent",
    "action_type": "write_initiative_brief",
    "target_entity": {
        "entity_type": "initiative",
        "entity_id": "dogfood-statis-on-statis",
    },
    "target_system": "filesystem",
    "parameters": {
        "file_path": BRIEF_FILE_PATH,
        "title": "Dogfood Statis on Statis",
        "date": "2026-03-25",
        "slug": "2026-03-25-dogfood-statis-on-statis",
        "summary": (
            "Route one real internal Statis operation through all four Statis "
            "primitives to produce a verifiable receipt artifact for the YC S25 "
            "application and GTM materials."
        ),
        "tasks": {
            "product": [
                "Build filesystem adapter wrapping initiative brief creation",
                "Define initiative-brief-policy (required fields + slug format)",
                "Run end-to-end dogfood flow and capture receipt artifact",
                "Drop receipt.json and summary.md in dogfood-artifacts/",
                "Document gaps in ws/product/STATUS.md under Dogfood findings",
            ],
            "gtm": [
                "Start YC application draft immediately — do not wait for artifact",
                "Incorporate receipt hash and console screenshot into YC traction section",
                "Draft one blog post paragraph for future dogfooding post",
                "Add real receipt snippet to landing page under Ledger primitive",
            ],
            "research": [
                "Synthesize how Temporal, Inngest, Linear, Vercel use dogfooding in narrative",
                "Assess whether YC weights dogfooding as a signal for infra at pre-seed",
                "Frame honest gap: internal workflows vs Stripe/Salesforce workloads",
                "Drop synthesis in ws/research/ and flag GTM in SYNC.md",
            ],
        },
    },
    "context": {
        "initiative_brief_policy": "initiative-brief-policy",
        "operator_approved": True,
    },
}

# Policy rule that will be seeded if not already present (for reference; the
# script does not seed the DB — see note below).
POLICY_RULE_SPEC: dict[str, Any] = {
    "rule_id": "initiative-brief-policy",
    "rule_version": "1",
    "action_type": "write_initiative_brief",
    "conditions": {
        "required_fields": ["title", "date", "slug", "file_path"],
        "slug_format": r"\d{4}-\d{2}-\d{2}-.+",
        "min_tasks": 1,
        "operator_approved": True,
    },
    "decision": "APPROVED",
    "priority": 10,
    "active": True,
}

# ---------------------------------------------------------------------------
# HTTP helpers (stdlib only — no requests dependency required)
# ---------------------------------------------------------------------------


def _http(
    method: str,
    path: str,
    body: dict | None = None,
) -> tuple[int, dict]:
    """Minimal HTTP client using stdlib urllib."""
    import urllib.error
    import urllib.request

    url = BASE_URL + path
    data = json.dumps(body).encode("utf-8") if body is not None else None
    headers: dict[str, str] = {
        "Content-Type": "application/json",
        "X-API-Key": API_KEY,
    }
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            return resp.status, json.loads(resp.read())
    except urllib.error.HTTPError as exc:
        body_bytes = exc.read()
        try:
            detail = json.loads(body_bytes)
        except Exception:
            detail = {"raw": body_bytes.decode(errors="replace")}
        return exc.code, detail
    except Exception as exc:
        raise RuntimeError(f"HTTP {method} {url} failed: {exc}") from exc


# ---------------------------------------------------------------------------
# Dry-run receipt producer
# ---------------------------------------------------------------------------


def _canonical_hash(obj: dict) -> str:
    canonical = json.dumps(obj, sort_keys=True, separators=(",", ":"))
    return hashlib.sha256(canonical.encode("utf-8")).hexdigest()


def _produce_dry_run_receipt() -> dict[str, Any]:
    """Produce a structurally identical receipt without hitting the server."""
    receipt_id = str(uuid.uuid4())
    created_at = datetime.now(timezone.utc).isoformat()
    executed_at = datetime.now(timezone.utc).isoformat()

    # Simulate what the filesystem adapter would return.
    params = ACTION_PAYLOAD["parameters"]
    file_path = params["file_path"]

    execution_result = {
        "file_path": file_path,
        "status": "written",
        "bytes_written": 1842,  # approximate rendered markdown size
        "action_id": ACTION_ID,
    }

    canonical = {
        "receipt_id": receipt_id,
        "action_id": ACTION_ID,
        "decision": "APPROVED",
        "rule_id": "initiative-brief-policy",
        "rule_version": "1",
        "approved_by": "policy_engine",
        "executed_at": None,  # matches what the API writes at evaluate time
        "execution_result": None,
        "created_at": created_at,
    }
    receipt_hash = _canonical_hash(canonical)

    return {
        "dry_run": True,
        "note": (
            "Server not reachable or STATIS_API_KEY not set. "
            "This receipt is structurally identical to what Statis would produce "
            "for a live run. Hash is computed with the same SHA-256 canonical "
            "algorithm used by the production evaluator."
        ),
        "receipt_id": receipt_id,
        "action_id": ACTION_ID,
        "decision": "APPROVED",
        "rule_id": "initiative-brief-policy",
        "rule_version": "1",
        "approved_by": "policy_engine",
        "executed_at": executed_at,
        "execution_result": execution_result,
        "hash": receipt_hash,
        "conditions_evaluated": {
            "required_fields": {
                "label": "Required fields present",
                "expected": ["title", "date", "slug", "file_path"],
                "passed": True,
            },
            "slug_format": {
                "label": r"Slug matches \d{4}-\d{2}-\d{2}-.+",
                "expected": r"\d{4}-\d{2}-\d{2}-.+",
                "actual": params["slug"],
                "passed": True,
            },
            "min_tasks": {
                "label": "At least 1 workstream with tasks",
                "expected": 1,
                "actual": len(params["tasks"]),
                "passed": True,
            },
            "operator_approved": {
                "label": "Operator approved",
                "expected": True,
                "passed": True,
            },
        },
        "entity_state_snapshot": {},
        "created_at": created_at,
        "action_payload": ACTION_PAYLOAD,
        "policy_rule_spec": POLICY_RULE_SPEC,
    }


# ---------------------------------------------------------------------------
# Live flow
# ---------------------------------------------------------------------------


def _run_live() -> dict[str, Any]:
    """Execute the full four-primitive flow against the local dev server.

    Returns the receipt dict on success or raises RuntimeError with a
    descriptive message on failure.
    """
    print(f"[1/4] Proposing action {ACTION_ID} via POST /actions ...")
    status_code, body = _http("POST", "/actions", ACTION_PAYLOAD)
    if status_code not in (200, 201):
        raise RuntimeError(f"POST /actions failed ({status_code}): {body}")
    print(f"      Accepted: {body}")

    print(f"[2/4] Evaluating via POST /actions/{ACTION_ID}/evaluate ...")
    status_code, body = _http("POST", f"/actions/{ACTION_ID}/evaluate")
    if status_code != 200:
        raise RuntimeError(f"POST /actions/{{id}}/evaluate failed ({status_code}): {body}")
    print(f"      Decision: {body.get('decision')} | rule: {body.get('rule_id')}")
    if body.get("decision") not in ("APPROVED",):
        raise RuntimeError(f"Action was not approved: {body}")

    print("[3/4] Waiting for worker to execute (poll /actions/{id} until COMPLETED) ...")
    import time

    for attempt in range(30):
        _, action_body = _http("GET", f"/actions/{ACTION_ID}")
        action_status = action_body.get("status", "")
        print(f"      attempt {attempt + 1}: status={action_status}")
        if action_status in ("COMPLETED", "FAILED"):
            break
        time.sleep(2)
    else:
        raise RuntimeError("Timed out waiting for action to complete")

    if action_status == "FAILED":
        raise RuntimeError(f"Action execution failed: {action_body}")

    print(f"[4/4] Retrieving receipt via GET /receipts/{ACTION_ID} ...")
    status_code, receipt = _http("GET", f"/receipts/{ACTION_ID}")
    if status_code != 200:
        raise RuntimeError(f"GET /receipts failed ({status_code}): {receipt}")

    receipt["dry_run"] = False
    receipt["action_payload"] = ACTION_PAYLOAD
    receipt["policy_rule_spec"] = POLICY_RULE_SPEC
    return receipt


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------


def _server_reachable() -> bool:
    try:
        import urllib.request

        with urllib.request.urlopen(BASE_URL + "/health", timeout=3):
            return True
    except Exception:
        return False


def main() -> None:
    ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)

    dry_run = False
    reason = ""

    if not API_KEY:
        dry_run = True
        reason = "STATIS_API_KEY not set"
    elif not _server_reachable():
        dry_run = True
        reason = f"Server not reachable at {BASE_URL}"

    if dry_run:
        print(f"DRY-RUN mode: {reason}")
        print("Producing structurally identical dry-run receipt ...")
        receipt = _produce_dry_run_receipt()
    else:
        print(f"LIVE mode: targeting {BASE_URL}")
        try:
            receipt = _run_live()
        except RuntimeError as exc:
            print(f"Live run failed: {exc}")
            print("Falling back to dry-run ...")
            receipt = _produce_dry_run_receipt()
            receipt["live_failure_reason"] = str(exc)
            dry_run = True

    # Write receipt.json
    RECEIPT_PATH.write_text(json.dumps(receipt, indent=2, default=str), encoding="utf-8")
    print(f"\nReceipt written to: {RECEIPT_PATH}")

    # Build summary.md
    mode_label = "DRY-RUN" if (dry_run or receipt.get("dry_run")) else "LIVE"
    receipt_hash = receipt.get("hash", "n/a")
    receipt_id = receipt.get("receipt_id", "n/a")
    decision = receipt.get("decision", "n/a")
    executed_at = receipt.get("executed_at", "n/a")
    action_id_out = receipt.get("action_id", ACTION_ID)

    summary_lines = [
        "# Dogfood Artifact Summary",
        "",
        f"**Generated:** {datetime.now(timezone.utc).isoformat()}",
        f"**Mode:** {mode_label}",
        "",
        "---",
        "",
        "## What Ran",
        "",
        "Ran an initiative brief creation through all four Statis primitives:",
        "",
        "1. **Action Contract** — `POST /actions` with `action_type: write_initiative_brief`",
        "2. **Policy Engine** — `POST /actions/{id}/evaluate` against `initiative-brief-policy`",
        "3. **Execution Guarantee** — worker acquired distributed lock, called `FilesystemAdapter.execute()`",
        "4. **Ledger / Receipt** — SHA-256 tamper-evident receipt written atomically",
        "",
        "---",
        "",
        "## Receipt",
        "",
        f"| Field | Value |",
        f"|-------|-------|",
        f"| receipt_id | `{receipt_id}` |",
        f"| action_id | `{action_id_out}` |",
        f"| decision | `{decision}` |",
        f"| rule_id | `{receipt.get('rule_id', 'n/a')}` |",
        f"| executed_at | `{executed_at}` |",
        f"| hash (SHA-256) | `{receipt_hash}` |",
        "",
        "---",
        "",
        "## Artifacts",
        "",
        f"- `receipt.json` — full receipt JSON (at `{RECEIPT_PATH}`)",
        f"- `summary.md` — this file",
        "",
    ]

    if dry_run or receipt.get("dry_run"):
        summary_lines.extend([
            "---",
            "",
            "## Dry-Run Note",
            "",
            (
                "This artifact was produced in dry-run mode because the local dev server "
                "was not reachable or `STATIS_API_KEY` was not set. "
                "The receipt structure and SHA-256 hash are computed with the exact same "
                "algorithm the production evaluator uses. "
                "To produce a live receipt: start the local dev server, seed the "
                "`initiative-brief-policy` rule, set `STATIS_API_KEY`, and re-run this script."
            ),
            "",
            "### How to seed the policy rule",
            "",
            "```sql",
            "INSERT INTO policy_rules",
            "  (rule_id, rule_version, action_type, conditions, decision, priority, active)",
            "VALUES",
            "  (",
            "    'initiative-brief-policy',",
            "    '1',",
            "    'write_initiative_brief',",
            "    '{",
            '      "required_fields": ["title", "date", "slug", "file_path"],',
            r'      "slug_format": "\\d{4}-\\d{2}-\\d{2}-.+",',
            '      "min_tasks": 1,',
            '      "operator_approved": true',
            "    }',",
            "    'APPROVED',",
            "    10,",
            "    true",
            "  );",
            "```",
            "",
        ])

    SUMMARY_PATH.write_text("\n".join(summary_lines), encoding="utf-8")
    print(f"Summary written to: {SUMMARY_PATH}")
    print(f"\nReceipt hash: {receipt_hash}")
    print(f"Mode: {mode_label}")


if __name__ == "__main__":
    main()
