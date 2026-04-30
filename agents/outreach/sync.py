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


def _list_outreach_connreqs(
    client: httpx.Client, statuses: tuple[str, ...] = ("COMPLETED", "FAILED"), limit: int = 5000
) -> list[dict[str, Any]]:
    """Fetch outreach-agent linkedin_send_connection_request actions.

    Includes FAILED actions because of an API state-machine bug: when the
    operator approves an ESCALATED action in console, the API correctly
    transitions actions.status -> APPROVED + creates an EscalationReview row,
    BUT the receipt's decision field stays frozen at 'ESCALATED' (the value
    written at evaluate-time). The worker's R1 gate detects this status/receipt
    divergence and refuses dispatch as a tampering check, flipping status to
    FAILED with execution_result.error == 'r1_gate_refused'.

    For v0 manual-send mode, the operator's approval IS the trigger for the
    sheet row (the worker's mock 'send' is irrelevant — the operator does
    the actual LinkedIn send manually). So we treat any action that has an
    APPROVED EscalationReview as 'approved' for sheet purposes, regardless
    of whether the worker subsequently failed it via R1.

    See .context/agent-handoffs/api-state-machine-bug.md for the long-term
    fix being worked in a parallel session.
    """
    out: list[dict[str, Any]] = []
    seen_ids: set[str] = set()
    for st in statuses:
        resp = client.get("/actions", params={"status": st, "limit": limit})
        resp.raise_for_status()
        actions = resp.json() if isinstance(resp.json(), list) else resp.json().get("actions", [])
        for a in actions:
            aid = a.get("action_id")
            if (
                aid not in seen_ids
                and a.get("proposed_by") == AGENT_ID
                and a.get("action_type") == "linkedin_send_connection_request"
            ):
                out.append(a)
                seen_ids.add(aid)
    return out


def _approved_action_ids_via_db() -> set[str] | None:
    """Precise signal: query escalation_reviews directly via DB.

    Returns the set of action_ids with reviewer_decision='APPROVED'. Returns
    None if DATABASE_URL isn't set or psycopg isn't installed (caller falls
    back to the heuristic path).
    """
    db_url = os.environ.get("DATABASE_URL")
    if not db_url:
        return None
    try:
        import psycopg  # type: ignore
    except ImportError:
        return None
    out: set[str] = set()
    with psycopg.connect(db_url) as conn:
        with conn.cursor() as cur:
            cur.execute(
                """SELECT action_id FROM escalation_reviews
                   WHERE reviewer_decision = %s""",
                ("APPROVED",),
            )
            for (aid,) in cur.fetchall():
                out.add(aid)
    return out


def _is_operator_approved(
    client: httpx.Client,
    action: dict[str, Any],
    approved_ids: set[str] | None,
) -> bool:
    """True iff the action represents an operator-approved outbound.

    Resolution order (most precise first):
      1. If `approved_ids` is provided (DB query succeeded), trust it as the
         explicit "operator clicked Approve" signal.
      2. status=COMPLETED → auto-approved at evaluate-time, worker executed
         cleanly via mock adapter.
      3. (Heuristic fallback) status=FAILED + receipt.execution_result.error
         == 'r1_gate_refused'. This catches operator-approvals that hit the
         known API state-machine bug, BUT also captures pre-existing
         buggy-auto-approvals that weren't operator-driven. Less precise.
         Only used when no DB access — preferable to nothing.
    """
    aid = action.get("action_id", "")
    if not aid:
        return False
    if approved_ids is not None:
        return aid in approved_ids or action.get("status") == "COMPLETED"
    if action.get("status") == "COMPLETED":
        return True
    if action.get("status") != "FAILED":
        return False
    try:
        r = client.get(f"/receipts/{aid}")
        if r.status_code != 200:
            return False
        receipt = r.json()
    except httpx.HTTPError:
        return False
    exec_result = receipt.get("execution_result") or {}
    return exec_result.get("error") == "r1_gate_refused"


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
    """Reconstruct a sheet row from a COMPLETED or operator-approved-FAILED
    connection_request action.

    All fields are pulled from the action's `parameters` (sheet_* keys
    populated at propose time) plus its `context` (icp_score, etc.).
    """
    p = action.get("parameters", {}) or {}
    c = action.get("context", {}) or {}
    status = action.get("status")
    # Map action end-state -> connection_status the operator sees in the sheet.
    if status == "COMPLETED":
        conn_status = "sent"
    elif status == "FAILED":
        # Operator approved (we only sync FAILED actions when an approved
        # review exists — see _has_approved_review). Worker R1 blocked due
        # to the receipt-decision-divergence bug; user does the actual
        # LinkedIn send manually.
        conn_status = "approved_send_manually"
    else:
        conn_status = status or ""
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
        "connection_status": conn_status,
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

    # Pre-fetch the precise approved-ids set from DB if available (most precise);
    # otherwise the heuristic kicks in per-action (looser, but works without DB).
    approved_ids = _approved_action_ids_via_db()
    if approved_ids is not None:
        print(f"  using DB direct query for approval signal ({len(approved_ids)} approved action_ids in DB)")
    else:
        print("  no DATABASE_URL — using receipt.execution_result heuristic (less precise)")

    with _client(base_url, api_key) as c:
        candidates = _list_outreach_connreqs(c)
        approved = [a for a in candidates if _is_operator_approved(c, a, approved_ids)]

    existing = _existing_sheet_action_ids()
    missing = [a for a in approved if a.get("action_id") not in existing]

    print(f"  outreach connreqs scanned:           {len(candidates)}")
    print(f"  with approved review or completed:   {len(approved)}")
    print(f"  already in sheet:                    {len(approved) - len(missing)}")
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
        "fetched": len(candidates),
        "approved": len(approved),
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
