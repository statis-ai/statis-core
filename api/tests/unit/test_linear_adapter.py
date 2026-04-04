"""Unit tests for LinearAdapter."""
from __future__ import annotations

import json
from http.server import BaseHTTPRequestHandler, HTTPServer
from threading import Thread
from typing import Any
from unittest.mock import MagicMock

from app.adapters.linear import LinearAdapter


def _action(action_type: str = "linear_create_issue", **params: Any) -> MagicMock:
    m = MagicMock()
    m.action_id = "act-1"
    m.action_type = action_type
    m.parameters = params
    return m


class _FakeLinearHandler(BaseHTTPRequestHandler):
    responses: list[tuple[int, dict]] = []
    last_request_body: dict = {}

    def log_message(self, *args: Any) -> None:
        pass

    def do_POST(self) -> None:
        length = int(self.headers.get("Content-Length", 0))
        body = json.loads(self.rfile.read(length))
        type(self).last_request_body = body

        status, resp_body = type(self).responses.pop(0)
        payload = json.dumps(resp_body).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)


def _make_server(responses: list[tuple[int, dict]]) -> tuple[HTTPServer, str]:
    _FakeLinearHandler.responses = list(responses)
    _FakeLinearHandler.last_request_body = {}
    server = HTTPServer(("127.0.0.1", 0), _FakeLinearHandler)
    port = server.server_address[1]
    t = Thread(target=server.handle_request)
    t.daemon = True
    t.start()
    return server, f"http://127.0.0.1:{port}"


def _adapter(base_url: str) -> LinearAdapter:
    adapter = LinearAdapter(api_key="lin_api_test")
    import app.adapters.linear as mod
    mod._ENDPOINT = base_url
    return adapter


def test_unsupported_action_type():
    adapter = LinearAdapter(api_key="key")
    action = _action(action_type="apply_discount")
    result = adapter.execute(action)
    assert result.success is False
    assert "does not handle" in (result.error or "")


def test_missing_api_key():
    adapter = LinearAdapter(api_key="")
    action = _action(team_id="TEAM", title="Bug")
    result = adapter.execute(action)
    assert result.success is False
    assert "LINEAR_API_KEY" in (result.error or "")


def test_create_issue_success():
    resp_body = {
        "data": {
            "issueCreate": {
                "success": True,
                "issue": {"id": "ISS-1", "identifier": "ENG-42", "url": "https://linear.app/i/ENG-42"},
            }
        }
    }
    server, base_url = _make_server([(200, resp_body)])
    adapter = _adapter(base_url)
    action = _action(action_type="linear_create_issue", team_id="TEAM", title="Fix the bug")
    result = adapter.execute(action)
    assert result.success is True
    assert result.result["issue_id"] == "ISS-1"
    assert "url" in result.result


def test_create_issue_missing_params():
    adapter = LinearAdapter(api_key="key")
    action = _action(action_type="linear_create_issue", team_id="TEAM")  # no title
    result = adapter.execute(action)
    assert result.success is False
    assert "required" in (result.error or "")


def test_update_issue_success():
    resp_body = {
        "data": {
            "issueUpdate": {
                "success": True,
                "issue": {"id": "ISS-1", "identifier": "ENG-42", "url": "https://linear.app/i/ENG-42"},
            }
        }
    }
    server, base_url = _make_server([(200, resp_body)])
    adapter = _adapter(base_url)
    action = _action(
        action_type="linear_update_issue",
        issue_id="ISS-1",
        title="Updated title",
    )
    result = adapter.execute(action)
    assert result.success is True
    assert result.result["issue_id"] == "ISS-1"


def test_update_issue_missing_id():
    adapter = LinearAdapter(api_key="key")
    action = _action(action_type="linear_update_issue", title="New title")  # no issue_id
    result = adapter.execute(action)
    assert result.success is False
    assert "required" in (result.error or "")
