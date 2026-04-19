"""Unit tests for SlackAdapter."""
from __future__ import annotations

import json
from http.server import BaseHTTPRequestHandler, HTTPServer
from threading import Thread
from typing import Any
from unittest.mock import MagicMock

from app.adapters.slack_adapter import SlackAdapter


def _action(action_type: str = "slack_send_message", **params: Any) -> MagicMock:
    m = MagicMock()
    m.action_id = "act-1"
    m.action_type = action_type
    m.parameters = params
    return m


class _FakeSlackHandler(BaseHTTPRequestHandler):
    responses: list[tuple[int, dict]] = []
    last_request_body: dict = {}
    last_request_headers: dict = {}

    def log_message(self, *args: Any) -> None:
        pass

    def do_POST(self) -> None:
        length = int(self.headers.get("Content-Length", 0))
        body = json.loads(self.rfile.read(length))
        type(self).last_request_body = body
        type(self).last_request_headers = dict(self.headers)

        status, resp_body = type(self).responses.pop(0)
        payload = json.dumps(resp_body).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)


def _make_server(responses: list[tuple[int, dict]]) -> tuple[HTTPServer, str]:
    _FakeSlackHandler.responses = list(responses)
    _FakeSlackHandler.last_request_body = {}
    _FakeSlackHandler.last_request_headers = {}
    server = HTTPServer(("127.0.0.1", 0), _FakeSlackHandler)
    port = server.server_address[1]
    t = Thread(target=server.handle_request)
    t.daemon = True
    t.start()
    return server, f"http://127.0.0.1:{port}"


def _adapter(base_url: str) -> SlackAdapter:
    adapter = SlackAdapter(token="xoxb-test")
    import app.adapters.slack_adapter as mod
    mod._BASE = base_url
    return adapter


def test_unsupported_action_type():
    adapter = SlackAdapter(token="tok")
    action = _action(action_type="apply_discount")
    result = adapter.execute(action)
    assert result.success is False
    assert "does not handle" in (result.error or "")


def test_missing_token():
    adapter = SlackAdapter(token="")
    action = _action(channel="#general", text="hello")
    result = adapter.execute(action)
    assert result.success is False
    assert "SLACK_BOT_TOKEN" in (result.error or "")


def test_send_message_success():
    server, base_url = _make_server(
        [(200, {"ok": True, "ts": "1234.5678", "channel": "C123"})]
    )
    adapter = _adapter(base_url)
    action = _action(action_type="slack_send_message", channel="#general", text="Hello!")
    result = adapter.execute(action)
    assert result.success is True
    assert result.result["ts"] == "1234.5678"
    assert result.result["channel"] == "C123"


def test_send_message_uses_idempotency_key():
    server, base_url = _make_server(
        [(200, {"ok": True, "ts": "1234.5678", "channel": "C123"})]
    )
    adapter = _adapter(base_url)
    action = _action(action_type="slack_send_message", channel="#general", text="Hello!")
    action.action_id = "statis-abc-123"
    adapter.execute(action)
    assert _FakeSlackHandler.last_request_headers.get("X-Slack-Idempotency-Key") == "statis-abc-123"


def test_send_message_missing_params():
    adapter = SlackAdapter(token="tok")
    action = _action(action_type="slack_send_message", channel="#general")  # no text
    result = adapter.execute(action)
    assert result.success is False
    assert "required" in (result.error or "")


def test_update_message_success():
    server, base_url = _make_server(
        [(200, {"ok": True, "ts": "1234.5678", "channel": "C123"})]
    )
    adapter = _adapter(base_url)
    action = _action(
        action_type="slack_update_message",
        channel="C123",
        ts="1234.5678",
        text="Updated!",
    )
    result = adapter.execute(action)
    assert result.success is True


def test_slack_api_error_response():
    server, base_url = _make_server(
        [(200, {"ok": False, "error": "channel_not_found"})]
    )
    adapter = _adapter(base_url)
    action = _action(action_type="slack_send_message", channel="#nonexistent", text="Hi")
    result = adapter.execute(action)
    assert result.success is False
    assert result.error == "channel_not_found"
