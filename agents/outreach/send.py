"""Send stage — gate the LinkedIn DM through Statis, log to Sheet (or CSV fallback).

In v0 the actual LinkedIn delivery is faked by MockLinkedInAdapter (writes to
a log file). When you approve an escalation in console, the worker invokes the
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

    aid_seed_send = f"send:{run_id}:{cand.source}:{cand.signal_url}"
    send_action_id = "send-" + hashlib.sha256(aid_seed_send.encode()).hexdigest()[:24]
    target_id = f"{cand.source}:{cand.author_handle or 'unknown'}"

    send_decision = "SKIPPED"
    send_action_id_real: str | None = None
    send_status = "skipped"

    if drafted.decision in ("APPROVED", "APPROVED_PENDING"):  # only attempt send if draft was approved (or pending exec)
        try:
            receipt = client.execute(
                action_id=send_action_id,
                action_type="linkedin_send_message",
                target={"entity_type": "prospect", "entity_id": target_id},
                target_system="linkedin",
                agent_id=AGENT_ID,
                parameters={
                    "recipient_profile": cand.author_url or cand.author_handle,
                    "recipient_name": cand.author_handle,
                    "message_body": drafted.message_body,
                    "campaign_id": "design-partner-beta",
                },
                context={
                    "icp_score": scored.icp_score,
                    "signal_seen_at": cand.signal_seen_at,
                    "days_since_last_contact": 999,  # never contacted before
                    "dnc": False,
                },
                timeout=2.0,
            )
            send_decision = "APPROVED"
            send_action_id_real = receipt.action_id
            send_status = "sent"
        except ActionDeniedError as e:
            send_decision = "DENIED"
            send_action_id_real = e.receipt.action_id if e.receipt else None
            send_status = "denied"
        except ActionEscalatedError as e:
            send_decision = "ESCALATED"
            send_action_id_real = e.action_id
            send_status = "pending_approval"
        except ActionTimeoutError as e:
            send_decision = "APPROVED_PENDING"
            send_action_id_real = e.action_id
            send_status = "approved_pending"

    # Log the row to CSV via a sheets_append_row gate (proves the log itself is gated).
    aid_seed_log = f"log:{run_id}:{cand.source}:{cand.signal_url}"
    log_action_id = "log-" + hashlib.sha256(aid_seed_log.encode()).hexdigest()[:24]
    log_action_id_real: str | None = None
    log_decision = "SKIPPED"

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
        "message_draft": drafted.message_body.replace("\n", " "),
        "send_status": send_status,
        "sent_at": "",
        "reply_received": "",
        "calendly_link": "https://calendly.com/aniket-statis/30min",
        "statis_action_id_intake": intake_action_id,
        "statis_action_id_score": scored.statis_action_id or "",
        "statis_action_id_qualify": qualify_action_id,
        "statis_action_id_draft": drafted.statis_action_id or "",
        "statis_action_id_send": send_action_id_real or "",
        "statis_action_id_log": "",
    }

    try:
        receipt = client.execute(
            action_id=log_action_id,
            action_type="sheets_append_row",
            target={"entity_type": "sheet", "entity_id": "outreach_log"},
            target_system="sheets_append_row",
            agent_id=AGENT_ID,
            parameters={
                "prospect_name": cand.author_handle or "",
                "linkedin_url": cand.author_url or cand.signal_url,
                "icp_score": scored.icp_score,
                "send_status": send_status,
                "statis_action_id_send": send_action_id_real or "",
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

    return {
        "send_decision": send_decision,
        "send_action_id": send_action_id_real,
        "log_decision": log_decision,
        "log_action_id": log_action_id_real,
        "csv_row": sheet_row,
        "log_backend": backend,
    }
