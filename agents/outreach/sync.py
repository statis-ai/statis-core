"""Sync-on-approval — write a sheet row for every approved-and-executed
connection request that isn't yet in the sheet.

Workflow:
  1. Agent runs → connection requests escalate, NO sheet rows written.
  2. Operator approves some in console.
  3. Worker executes approved actions → status transitions to COMPLETED.
  4. This sync runs (manually or as `python -m agents.outreach.main --sync`)
     → reconstructs sheet rows from each COMPLETED action's parameters.

The agent intentionally bundled all sheet-row context into the
linkedin_send_connection_request action's parameters at propose time
(see send.py), so this sync only needs to read that one action per row.
"""
from __future__ import annotations

import argparse
import os
import sys
from datetime import datetime, timezone
from typing import Any

import httpx

from . import sheets


AGENT_ID = "outreach-agent"


def _client(base_url: str, api_key: str) -> httpx.Client:
    return httpx.Client(
        base_url=base_url.rstrip("/"),
        headers={"X-API-Key": api_key},
        timeout=30.0,
    )


def _list_completed_connreqs(client: httpx.Client, limit: int = 5000) -> list[dict[str, Any]]:
    """Fetch all COMPLETED linkedin_send_connection_request actions for the
    outreach-agent. Filters down by the API's status param."""
    resp = client.get(
        "/actions",
        params={"status": "COMPLETED", "limit": limit},
    )
    resp.raise_for_status()
    actions = resp.json() if isinstance(resp.json(), list) else resp.json().get("actions", [])
    return [
        a for a in actions
        if a.get("proposed_by") == AGENT_ID
        and a.get("action_type") == "linkedin_send_connection_request"
    ]


def _existing_sheet_action_ids() -> set[str]:
    """Return the set of conn_action_ids already logged in the sheet."""
    sid = sheets.get_sheet_id()
    if not sid:
        return set()
    svc, _ = sheets._services()
    tab = sheets._first_sheet_title(svc, sid)
    data = svc.spreadsheets().values().get(
        spreadsheetId=sid, range=f"{tab}!A:AZ"
    ).execute()
    rows = data.get("values", [])
    if len(rows) <= 1:
        return set()
    header = rows[0]
    if "statis_action_id_connection" not in header:
        return set()
    idx = header.index("statis_action_id_connection")
    return {r[idx] for r in rows[1:] if len(r) > idx and r[idx]}


def _row_from_action(action: dict[str, Any]) -> dict[str, Any]:
    """Reconstruct a sheet row from a COMPLETED connection_request action.

    All fields are pulled from the action's `parameters` (sheet_* keys
    populated at propose time) plus its `context` (icp_score, etc.) plus
    the receipt's executed_at if available.
    """
    p = action.get("parameters", {}) or {}
    c = action.get("context", {}) or {}
    return {
        "timestamp": action.get("created_at") or datetime.now(timezone.utc).isoformat(),
        "prospect_handle": p.get("recipient_name") or p.get("sheet_prospect_handle", ""),
        "prospect_url": p.get("sheet_prospect_url") or p.get("recipient_profile", ""),
        "source": p.get("sheet_source", ""),
        "signal_url": p.get("sheet_signal_url", ""),
        "signal_summary": p.get("sheet_signal_summary", ""),
        "inferred_role": p.get("sheet_inferred_role", ""),
        "inferred_company": p.get("sheet_inferred_company", ""),
        "icp_score": c.get("icp_score", ""),
        "intake_decision": p.get("sheet_intake_decision", ""),
        "qualify_decision": p.get("sheet_qualify_decision", ""),
        "connection_note": (p.get("connection_note") or "").replace("\n", " "),
        "followup_dm": (p.get("followup_dm") or "").replace("\n", " "),
        "connection_status": "sent",  # COMPLETED == sent (mock or real)
        "send_status": "queued_post_accept",
        "sent_at": (
            action.get("decided_at")
            or action.get("updated_at")
            or datetime.now(timezone.utc).isoformat()
        ),
        "accepted_at": "",
        "reply_received": "",
        "calendly_link": "https://calendly.com/aniket-statis/30min",
        "statis_action_id_intake": p.get("sheet_intake_action_id", ""),
        "statis_action_id_score": p.get("sheet_score_action_id", ""),
        "statis_action_id_qualify": p.get("sheet_qualify_action_id", ""),
        "statis_action_id_draft": p.get("sheet_draft_action_id", ""),
        "statis_action_id_connection": action.get("action_id", ""),
        "statis_action_id_send": "",
        "statis_action_id_log": "",
    }


def sync(base_url: str, api_key: str, dry_run: bool = False) -> dict[str, int]:
    """Read approved+completed connreqs, write any missing sheet rows.

    Returns counts: {fetched, missing, written, skipped}."""
    if not sheets.get_sheet_id():
        print("  ! no sheet configured (run `python -m agents.outreach.sheets attach <id>` first)")
        return {"fetched": 0, "missing": 0, "written": 0, "skipped": 0}

    with _client(base_url, api_key) as c:
        completed = _list_completed_connreqs(c)

    existing = _existing_sheet_action_ids()
    missing = [a for a in completed if a.get("action_id") not in existing]

    print(f"  COMPLETED connreqs (outreach-agent): {len(completed)}")
    print(f"  already in sheet:                    {len(completed) - len(missing)}")
    print(f"  missing (will write):                {len(missing)}")

    written = 0
    skipped = 0
    for a in missing:
        row = _row_from_action(a)
        if not row.get("prospect_handle") and not row.get("connection_note"):
            print(f"  ! skipping {a.get('action_id')} — no prospect_handle/connection_note")
            skipped += 1
            continue
        if dry_run:
            print(
                f"    [DRY] would write: {row['prospect_handle']:<22} "
                f"score={row['icp_score']} aid={a.get('action_id')}"
            )
            written += 1
            continue
        try:
            sheets.append_row(row)
            print(
                f"    + {row['prospect_handle']:<22} score={row['icp_score']:<4} "
                f"aid={a.get('action_id')}"
            )
            written += 1
        except Exception as e:
            print(f"  ! sheets append failed for {a.get('action_id')}: {e}")
            skipped += 1

    return {
        "fetched": len(completed),
        "missing": len(missing),
        "written": written,
        "skipped": skipped,
    }


def _cli() -> int:
    p = argparse.ArgumentParser(
        description="Sync approved+completed connection requests into the sheet."
    )
    p.add_argument(
        "--base-url",
        default=os.environ.get("STATIS_BASE_URL", "https://statis-core.onrender.com"),
    )
    p.add_argument("--dry-run", action="store_true")
    args = p.parse_args()

    api_key = os.environ.get("STATIS_API_KEY")
    if not api_key:
        print("ERROR: STATIS_API_KEY not set", file=sys.stderr)
        return 2

    result = sync(args.base_url, api_key, dry_run=args.dry_run)
    print()
    print(f"  done: {result}")
    return 0


if __name__ == "__main__":
    raise SystemExit(_cli())
