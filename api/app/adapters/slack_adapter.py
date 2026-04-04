"""Slack adapter — send and update messages via the Slack Web API.

Configuration (env vars or constructor args):
    SLACK_BOT_TOKEN   — Slack Bot OAuth token (xoxb-...)

Uses action_id as X-Slack-Idempotency-Key for idempotent message sending.
Filename is slack_adapter.py (not slack.py) to avoid collision with
app/notifications/slack.py.
"""
from __future__ import annotations

import json
import os
from typing import Any, Optional
from urllib.request import Request, urlopen
import urllib.error

from app.adapters.base import BaseAdapter, ExecutionResult

SUPPORTED = {"slack_send_message", "slack_update_message"}
_BASE = "https://slack.com/api"


class SlackAdapter(BaseAdapter):
    def __init__(self, token: Optional[str] = None) -> None:
        self._token = token or os.environ.get("SLACK_BOT_TOKEN", "")

    def execute(self, action: Any) -> ExecutionResult:
        action_id: str = getattr(action, "action_id", action.get("action_id", ""))
        action_type: str = getattr(action, "action_type", action.get("action_type", ""))
        params: dict = getattr(action, "parameters", action.get("parameters", {}))

        if action_type not in SUPPORTED:
            return ExecutionResult(
                success=False,
                result={},
                error=f"SlackAdapter does not handle action_type={action_type!r}",
            )

        if not self._token:
            return ExecutionResult(
                success=False, result={}, error="SLACK_BOT_TOKEN is not set"
            )

        try:
            if action_type == "slack_send_message":
                return self._send_message(action_id, params)
            if action_type == "slack_update_message":
                return self._update_message(params)
        except _SlackError as exc:
            return ExecutionResult(success=False, result={}, error=str(exc))
        except Exception as exc:
            return ExecutionResult(success=False, result={}, error=str(exc))

        return ExecutionResult(success=False, result={}, error="unhandled")

    def _send_message(self, action_id: str, params: dict) -> ExecutionResult:
        channel = params.get("channel", "")
        text = params.get("text", "")
        if not (channel and text):
            return ExecutionResult(
                success=False, result={}, error="channel and text required"
            )
        body: dict[str, Any] = {"channel": channel, "text": text}
        if "blocks" in params:
            body["blocks"] = params["blocks"]

        resp = self._post("chat.postMessage", body, idempotency_key=action_id)
        return ExecutionResult(
            success=resp.get("ok", False),
            result={"ts": resp.get("ts", ""), "channel": resp.get("channel", "")},
            error=resp.get("error") if not resp.get("ok") else None,
        )

    def _update_message(self, params: dict) -> ExecutionResult:
        channel = params.get("channel", "")
        ts = params.get("ts", "")
        text = params.get("text", "")
        if not (channel and ts and text):
            return ExecutionResult(
                success=False, result={}, error="channel, ts, and text required"
            )
        body: dict[str, Any] = {"channel": channel, "ts": ts, "text": text}
        if "blocks" in params:
            body["blocks"] = params["blocks"]

        resp = self._post("chat.update", body)
        return ExecutionResult(
            success=resp.get("ok", False),
            result={"ts": resp.get("ts", ""), "channel": resp.get("channel", "")},
            error=resp.get("error") if not resp.get("ok") else None,
        )

    def _post(self, method: str, body: dict, idempotency_key: str = "") -> dict:
        data = json.dumps(body).encode()
        headers: dict[str, str] = {
            "Authorization": f"Bearer {self._token}",
            "Content-Type": "application/json; charset=utf-8",
        }
        if idempotency_key:
            headers["X-Slack-Idempotency-Key"] = idempotency_key

        req = Request(
            f"{_BASE}/{method}",
            data=data,
            headers=headers,
            method="POST",
        )
        try:
            with urlopen(req, timeout=30) as resp:
                return json.loads(resp.read())
        except urllib.error.HTTPError as exc:
            raise _SlackError(f"HTTP {exc.code}: {exc.read().decode()}") from exc


class _SlackError(Exception):
    pass
