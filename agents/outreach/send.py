"""Send stage — gate the LinkedIn connection request through Statis, log to Sheet.

Two-step LinkedIn flow:
  1. linkedin_send_connection_request  — invite + 280-char note. THIS run.
  2. linkedin_send_message              — post-accept follow-up DM. Drafted now,
                                          gated separately later (after the
                                          prospect accepts the connection).

In v0 the actual delivery is faked by MockLinkedInAdapter (writes to a log
file). When you approve an escalation in console, the worker invokes the
mock adapter, writes a real receipt, and the action transitions to COMPLETED.
"""
from __future__ import annotations

import csv
import hashlib
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from statis import StatisClient, ActionDeniedError, ActionEscalatedError, ActionTimeoutError

from . import sheets
from .draft import DraftedMessage
from .score import AGENT_ID


CSV_PATH = Path(__file__).parent / "outreach_log.csv"
CSV_COLUMNS = sheets.HEADER  # single source of truth for column order


def _ensure_csv() -> None:
    if not CSV_PATH.exists():
        with CSV_PATH.open("w", newline="") as f:
            csv.writer(f).writerow(CSV_COLUMNS)


def _csv_append(row: dict[str, Any]) -> None:
    _ensure_csv()
    with CSV_PATH.open("a", newline="") as f:
        csv.writer(f).writerow([row.get(c, "") for c in CSV_COLUMNS])


def _log_row(row: dict[str, Any]) -> str:
    """Append to Google Sheets if configured, else CSV. Returns the backend used."""
    if sheets.get_sheet_id():
        try:
            sheets.append_row(row)
            return "sheets"
        except Exception as e:
            print(f"  ! sheets append failed ({e}), falling back to CSV")
    _csv_append(row)
    return "csv"


def send_and_log(
    client: StatisClient,
    drafted: DraftedMessage,
    run_id: str = "v0",
    intake_action_id: str = "",
    intake_decision: str = "",
    qualify_action_id: str = "",
    qualify_decision: str = "",
) -> dict[str, Any]:
    scored = drafted.scored
    cand = scored.candidate
    target_key = cand.target_linkedin_url or cand.target_name or cand.author_handle or "company-only"
    target_id = f"{cand.source}:{cand.target_name or cand.author_handle or 'unknown'}"

    # ─── Step 1: gate the connection request (this run's actual outbound) ───
    aid_seed_conn = f"connreq:{run_id}:{cand.source}:{cand.signal_url}:{target_key}"
    conn_action_id = "connreq-" + hashlib.sha256(aid_seed_conn.encode()).hexdigest()[:24]

    conn_decision = "SKIPPED"
    conn_action_id_real: str | None = None
    connection_status = "skipped"

    if drafted.decision in ("APPROVED", "APPROVED_PENDING"):
        # Bundle the FULL sheet-row context into the connection_request action's
        # parameters + context. The sync command later reconstructs the sheet
        # row from this single action — no need to re-query the related
        # intake/score/qualify/draft actions.
        try:
            receipt = client.execute(
                action_id=conn_action_id,
                action_type="linkedin_send_connection_request",
                target={"entity_type": "prospect", "entity_id": target_id},
                target_system="linkedin",
                agent_id=AGENT_ID,
                parameters={
                    "recipient_profile": cand.target_linkedin_url or cand.author_url or cand.author_handle,
                    "recipient_name": cand.target_name or cand.author_handle,
                    "connection_note": drafted.connection_note,
                    "followup_dm": drafted.followup_dm,
                    "campaign_id": "design-partner-beta",
                    # ─ Sheet-row reconstruction context (read by sync.py) ─
                    "sheet_prospect_handle": cand.author_handle or "",
                    "sheet_prospect_url": cand.target_linkedin_url or cand.author_url or "",
                    "sheet_source": cand.source,
                    "sheet_signal_url": cand.signal_url,
                    "sheet_signal_summary": (cand.signal_text or "")[:240].replace("\n", " "),
                    "sheet_inferred_role": cand.target_role or scored.inferred_role or "",
                    "sheet_inferred_company": cand.company_name or scored.inferred_company or "",
                    "sheet_intake_action_id": intake_action_id,
                    "sheet_intake_decision": intake_decision,
                    "sheet_score_action_id": scored.statis_action_id or "",
                    "sheet_qualify_action_id": qualify_action_id,
                    "sheet_qualify_decision": qualify_decision,
                    "sheet_draft_action_id": drafted.statis_action_id or "",
                },
                context={
                    "icp_score": scored.icp_score,
                    "signal_seen_at": cand.signal_seen_at,
                    "days_since_last_contact": 999,
                    "dnc": False,
                },
                timeout=2.0,
            )
            conn_decision = "APPROVED"
            conn_action_id_real = receipt.action_id
            connection_status = "sent"
        except ActionDeniedError as e:
            conn_decision = "DENIED"
            conn_action_id_real = e.receipt.action_id if e.receipt else None
            connection_status = "denied"
        except ActionEscalatedError as e:
            conn_decision = "ESCALATED"
            conn_action_id_real = e.action_id
            connection_status = "pending_approval"
        except ActionTimeoutError as e:
            conn_decision = "APPROVED_PENDING"
            conn_action_id_real = e.action_id
            connection_status = "approved_pending"

    # ─── Step 2: log to sheet — ONLY when the connection_request was approved.
    #
    # Sync-on-approval semantics (per operator preference): the sheet is the
    # "approved/sent" log, NOT a staging area. ESCALATED connection requests
    # do NOT write a sheet row here — the sync command (`agents.outreach.sync`)
    # writes them after the operator approves in console + the worker executes.
    #
    # In manual-send mode today, conn_decision is always ESCALATED, so this
    # block is a no-op for every prospect. In future when score-90+ auto-approves
    # land back, those will write here on the agent run itself.
    aid_seed_log = f"log:{run_id}:{cand.source}:{cand.signal_url}:{target_key}"
    log_action_id = "log-" + hashlib.sha256(aid_seed_log.encode()).hexdigest()[:24]
    log_action_id_real: str | None = None
    log_decision = "SKIPPED"

    should_log_now = conn_decision in ("APPROVED", "APPROVED_PENDING")

    sheet_row = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "prospect_handle": cand.author_handle or "",
        "prospect_url": cand.author_url or "",
        "source": cand.source,
        "signal_url": cand.signal_url,
        "signal_summary": (cand.signal_text or "")[:240].replace("\n", " "),
        "inferred_role": scored.inferred_role or "",
        "inferred_company": scored.inferred_company or "",
        "icp_score": scored.icp_score,
        "intake_decision": intake_decision,
        "qualify_decision": qualify_decision,
        "connection_note": drafted.connection_note.replace("\n", " "),
        "followup_dm": drafted.followup_dm.replace("\n", " "),
        "connection_status": connection_status,
        "send_status": "queued_post_accept",  # post-accept DM still draft-only
        "sent_at": "",
        "accepted_at": "",
        "reply_received": "",
        "calendly_link": "https://calendly.com/aniket-statis/30min",
        "statis_action_id_intake": intake_action_id,
        "statis_action_id_score": scored.statis_action_id or "",
        "statis_action_id_qualify": qualify_action_id,
        "statis_action_id_draft": drafted.statis_action_id or "",
        "statis_action_id_connection": conn_action_id_real or "",
        "statis_action_id_send": "",  # populated only after follow-up DM is gated
        "statis_action_id_log": "",
    }

    if should_log_now:
        try:
            receipt = client.execute(
                action_id=log_action_id,
                action_type="sheets_append_row",
                target={"entity_type": "sheet", "entity_id": "outreach_log"},
                target_system="sheets_append_row",
                agent_id=AGENT_ID,
                parameters={
                    "prospect_name": cand.target_name or cand.author_handle or "",
                    "linkedin_url": cand.target_linkedin_url or cand.author_url or cand.signal_url,
                    "icp_score": scored.icp_score,
                    "connection_status": connection_status,
                    "statis_action_id_connection": conn_action_id_real or "",
                },
                context={"icp_score": scored.icp_score},
                timeout=2.0,
            )
            log_decision = "APPROVED"
            log_action_id_real = receipt.action_id
        except ActionDeniedError as e:
            log_decision = "DENIED"
            log_action_id_real = e.receipt.action_id if e.receipt else None
        except ActionEscalatedError as e:
            log_decision = "ESCALATED"
            log_action_id_real = e.action_id
        except ActionTimeoutError as e:
            log_decision = "APPROVED_PENDING"
            log_action_id_real = e.action_id

        sheet_row["statis_action_id_log"] = log_action_id_real or ""
        backend = _log_row(sheet_row)
    else:
        log_decision = "DEFERRED_TO_SYNC"  # sync command writes this row after approval
        backend = "deferred"

    return {
        # Legacy keys preserved for main.py print line — map send_* → conn_*
        "send_decision": conn_decision,
        "send_action_id": conn_action_id_real,
        "connection_decision": conn_decision,
        "connection_action_id": conn_action_id_real,
        "log_decision": log_decision,
        "log_action_id": log_action_id_real,
        "csv_row": sheet_row,
        "log_backend": backend,
    }
