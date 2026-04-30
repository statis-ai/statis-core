"""Mock LinkedIn adapter — logs would-send DMs to a file without hitting LinkedIn.

Swap to UnipileLinkedInAdapter once the Unipile account is wired up.
The interface is identical; only the execute() body changes.
"""
from __future__ import annotations

import json
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from app.adapters.base import BaseAdapter, ExecutionResult


_DEFAULT_LOG = "/tmp/statis_linkedin_mock.log"


class MockLinkedInAdapter(BaseAdapter):
    _SUPPORTED = {
        "linkedin_send_message",          # post-accept follow-up DM
        "linkedin_send_connection_request",  # invite + connection note
        "linkedin_connect",               # legacy alias
    }

    def __init__(self, log_path: str | None = None) -> None:
        self._log_path = Path(log_path or os.getenv("LINKEDIN_MOCK_LOG", _DEFAULT_LOG))
        self._log_path.parent.mkdir(parents=True, exist_ok=True)

    def execute(self, action: Any) -> ExecutionResult:
        action_id: str = action.action_id if hasattr(action, "action_id") else action["action_id"]
        action_type: str = (
            action.action_type if hasattr(action, "action_type") else action["action_type"]
        )
        params: dict = (
            action.parameters if hasattr(action, "parameters") else action.get("parameters", {})
        )

        if action_type not in self._SUPPORTED:
            return ExecutionResult(
                success=False,
                result={},
                error=f"MockLinkedInAdapter does not handle action_type={action_type!r}",
            )

        # connection_note (invite) vs message_body (post-accept DM) — both
        # supported in the same record for cross-action audit traceability.
        record = {
            "ts": datetime.now(timezone.utc).isoformat(),
            "action_id": action_id,
            "action_type": action_type,
            "recipient": params.get("recipient_profile") or params.get("linkedin_url"),
            "recipient_name": params.get("recipient_name"),
            "connection_note": params.get("connection_note"),
            "message_body": params.get("message_body") or params.get("body"),
            "campaign_id": params.get("campaign_id"),
        }
        with self._log_path.open("a") as f:
            f.write(json.dumps(record) + "\n")

        return ExecutionResult(
            success=True,
            result={
                "linkedin_message_id": f"li_mock_{action_id[:12]}",
                "delivered_via": "mock",
                "log_path": str(self._log_path),
            },
            error=None,
        )
