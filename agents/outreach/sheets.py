"""Google Sheets backend for the outreach agent.

Replaces the local CSV with a shared spreadsheet that the service account
writes to. The agent appends rows after each pipeline run; you can edit
manually (mark DNC, add notes, status updates).

Setup is one-shot via `bootstrap_sheet()` — creates the spreadsheet,
seeds the header row, shares with you, and persists the sheet_id locally.
"""
from __future__ import annotations

import os
from pathlib import Path
from typing import Any

from google.oauth2 import service_account
from googleapiclient.discovery import build


_SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive",
]
_THIS_DIR = Path(__file__).parent
_SA_PATH = _THIS_DIR / ".service_account.json"
_SHEET_ID_PATH = _THIS_DIR / ".sheet_id"


def _first_sheet_title(sheets_svc: Any, spreadsheet_id: str) -> str:
    meta = sheets_svc.spreadsheets().get(
        spreadsheetId=spreadsheet_id, fields="sheets.properties(title,sheetId)"
    ).execute()
    return meta["sheets"][0]["properties"]["title"]


def _first_sheet_id(sheets_svc: Any, spreadsheet_id: str) -> int:
    meta = sheets_svc.spreadsheets().get(
        spreadsheetId=spreadsheet_id, fields="sheets.properties(title,sheetId)"
    ).execute()
    return int(meta["sheets"][0]["properties"]["sheetId"])

HEADER = [
    "timestamp",
    "prospect_handle",
    "prospect_url",
    "source",
    "signal_url",
    "signal_summary",
    "inferred_role",
    "inferred_company",
    "icp_score",
    "intake_decision",
    "qualify_decision",
    "message_draft",
    "send_status",
    "sent_at",
    "reply_received",
    "calendly_link",
    "statis_action_id_intake",
    "statis_action_id_score",
    "statis_action_id_qualify",
    "statis_action_id_draft",
    "statis_action_id_send",
    "statis_action_id_log",
]


def _credentials() -> service_account.Credentials:
    if not _SA_PATH.exists():
        raise FileNotFoundError(
            f"Service account JSON not found at {_SA_PATH}. "
            "Save it from GCP and re-run."
        )
    return service_account.Credentials.from_service_account_file(
        str(_SA_PATH), scopes=_SCOPES
    )


def _services() -> tuple[Any, Any]:
    creds = _credentials()
    sheets = build("sheets", "v4", credentials=creds, cache_discovery=False)
    drive = build("drive", "v3", credentials=creds, cache_discovery=False)
    return sheets, drive


def get_sheet_id() -> str | None:
    if _SHEET_ID_PATH.exists():
        sid = _SHEET_ID_PATH.read_text().strip()
        return sid or None
    env = os.environ.get("OUTREACH_SHEET_ID")
    return env or None


def bootstrap_sheet(share_with_email: str | None = None, title: str | None = None) -> dict[str, str]:
    """Create the Prospects spreadsheet, seed header, share with the user.

    Idempotent: if a sheet_id is already saved, returns its info without re-creating.
    """
    existing = get_sheet_id()
    if existing:
        return {
            "sheet_id": existing,
            "url": f"https://docs.google.com/spreadsheets/d/{existing}",
            "status": "already_exists",
        }

    sheets, drive = _services()
    title = title or "Statis — Outreach Prospects"

    created = sheets.spreadsheets().create(
        body={
            "properties": {"title": title},
            "sheets": [{"properties": {"title": _SHEET_NAME}}],
        },
        fields="spreadsheetId",
    ).execute()
    sheet_id: str = created["spreadsheetId"]

    sheets.spreadsheets().values().update(
        spreadsheetId=sheet_id,
        range=f"{_SHEET_NAME}!A1",
        valueInputOption="RAW",
        body={"values": [HEADER]},
    ).execute()

    sheets.spreadsheets().batchUpdate(
        spreadsheetId=sheet_id,
        body={
            "requests": [
                {
                    "repeatCell": {
                        "range": {"sheetId": 0, "startRowIndex": 0, "endRowIndex": 1},
                        "cell": {
                            "userEnteredFormat": {
                                "textFormat": {"bold": True},
                                "backgroundColor": {"red": 0.94, "green": 0.94, "blue": 0.94},
                            }
                        },
                        "fields": "userEnteredFormat(textFormat,backgroundColor)",
                    }
                },
                {
                    "updateSheetProperties": {
                        "properties": {"sheetId": 0, "gridProperties": {"frozenRowCount": 1}},
                        "fields": "gridProperties.frozenRowCount",
                    }
                },
            ]
        },
    ).execute()

    if share_with_email:
        drive.permissions().create(
            fileId=sheet_id,
            body={"type": "user", "role": "writer", "emailAddress": share_with_email},
            sendNotificationEmail=False,
        ).execute()

    _SHEET_ID_PATH.write_text(sheet_id + "\n")

    return {
        "sheet_id": sheet_id,
        "url": f"https://docs.google.com/spreadsheets/d/{sheet_id}",
        "status": "created",
    }


def append_row(row: dict[str, Any]) -> None:
    sheet_id = get_sheet_id()
    if not sheet_id:
        raise RuntimeError(
            "No sheet_id configured. Run `python -m agents.outreach.sheets bootstrap`."
        )
    sheets, _ = _services()
    tab = _first_sheet_title(sheets, sheet_id)
    values = [[row.get(c, "") for c in HEADER]]
    sheets.spreadsheets().values().append(
        spreadsheetId=sheet_id,
        range=f"{tab}!A:A",
        valueInputOption="USER_ENTERED",
        insertDataOption="INSERT_ROWS",
        body={"values": values},
    ).execute()


def init_existing_sheet(spreadsheet_id: str) -> dict[str, str]:
    """Write the header row + freeze + bold styling to an existing blank sheet.

    Use when the user created the sheet themselves (e.g. via sheets.new) and
    shared it with the service account. Idempotent — safe to re-run.
    """
    sheets, _ = _services()
    tab_title = _first_sheet_title(sheets, spreadsheet_id)
    tab_id = _first_sheet_id(sheets, spreadsheet_id)

    # Read existing first row to detect prior init
    existing = (
        sheets.spreadsheets()
        .values()
        .get(spreadsheetId=spreadsheet_id, range=f"{tab_title}!A1:Z1")
        .execute()
        .get("values", [])
    )
    is_initialized = bool(existing) and existing[0][:3] == HEADER[:3]

    if not is_initialized:
        sheets.spreadsheets().values().update(
            spreadsheetId=spreadsheet_id,
            range=f"{tab_title}!A1",
            valueInputOption="RAW",
            body={"values": [HEADER]},
        ).execute()

    sheets.spreadsheets().batchUpdate(
        spreadsheetId=spreadsheet_id,
        body={
            "requests": [
                {
                    "repeatCell": {
                        "range": {"sheetId": tab_id, "startRowIndex": 0, "endRowIndex": 1},
                        "cell": {
                            "userEnteredFormat": {
                                "textFormat": {"bold": True},
                                "backgroundColor": {"red": 0.94, "green": 0.94, "blue": 0.94},
                            }
                        },
                        "fields": "userEnteredFormat(textFormat,backgroundColor)",
                    }
                },
                {
                    "updateSheetProperties": {
                        "properties": {"sheetId": tab_id, "gridProperties": {"frozenRowCount": 1}},
                        "fields": "gridProperties.frozenRowCount",
                    }
                },
            ]
        },
    ).execute()

    _SHEET_ID_PATH.write_text(spreadsheet_id + "\n")
    return {
        "sheet_id": spreadsheet_id,
        "tab": tab_title,
        "url": f"https://docs.google.com/spreadsheets/d/{spreadsheet_id}",
        "header_written": "no" if is_initialized else "yes",
    }


def _cli() -> int:
    import argparse
    import json

    p = argparse.ArgumentParser()
    sub = p.add_subparsers(dest="cmd", required=True)
    b = sub.add_parser("bootstrap", help="Create a new Prospects spreadsheet")
    b.add_argument(
        "--share",
        default=os.environ.get("OUTREACH_SHEET_SHARE_EMAIL", "aniket.continuum@gmail.com"),
        help="Email to grant Editor access",
    )
    b.add_argument("--title", default=None)
    a = sub.add_parser("attach", help="Attach to an existing sheet (created by user)")
    a.add_argument("spreadsheet_id", help="Spreadsheet ID from the URL")
    sub.add_parser("info", help="Print current sheet info")
    args = p.parse_args()

    if args.cmd == "bootstrap":
        info = bootstrap_sheet(share_with_email=args.share, title=args.title)
        print(json.dumps(info, indent=2))
        return 0
    if args.cmd == "attach":
        info = init_existing_sheet(args.spreadsheet_id)
        print(json.dumps(info, indent=2))
        return 0
    if args.cmd == "info":
        sid = get_sheet_id()
        if not sid:
            print("No sheet configured.")
            return 1
        print(f"sheet_id: {sid}")
        print(f"url:      https://docs.google.com/spreadsheets/d/{sid}")
        return 0
    return 1


if __name__ == "__main__":
    raise SystemExit(_cli())
