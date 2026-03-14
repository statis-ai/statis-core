"""Unit tests for ZendeskAdapter."""
from __future__ import annotations

import json
from http.server import BaseHTTPRequestHandler, HTTPServer
from threading import Thread
from typing import Any
from unittest.mock import MagicMock

from app.adapters.zendesk import ZendeskAdapter


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _action(
    action_id: str = "act-1",
    action_type: str = "zendesk_create_ticket",
    **params,
) -> MagicMock:
    m = MagicMock()
    m.action_id = action_id
    m.action_type = action_type
    m.parameters = params
    return m


class _FakeZendeskHandler(BaseHTTPRequestHandler):
    responses: list[tuple[int, dict]] = []
    last_request_body: dict = {}
    last_request_method: str = ""

    def log_message(self, *args: Any) -> None:
        pass

    def _handle(self) -> None:
        length = int(self.headers.get("Content-Length", 0))
        body = json.loads(self.rfile.read(length)) if length else {}
        type(self).last_request_body = body
        type(self).last_request_method = self.command

        status, resp_body = type(self).responses.pop(0)
        payload = json.dumps(resp_body).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)

    do_POST = _handle
    do_PUT = _handle


def _make_server(responses: list[tuple[int, dict]]) -> tuple[HTTPServer, str]:
    _FakeZendeskHandler.responses = list(responses)
    _FakeZendeskHandler.last_request_body = {}
    _FakeZendeskHandler.last_request_method = ""
    server = HTTPServer(("127.0.0.1", 0), _FakeZendeskHandler)
    port = server.server_address[1]
    t = Thread(target=server.handle_request)
    t.daemon = True
    t.start()
    return server, f"http://127.0.0.1:{port}"


def _adapter(base_url: str) -> ZendeskAdapter:
    # Override _base_url by patching the subdomain
    adapter = ZendeskAdapter.__new__(ZendeskAdapter)
    adapter._subdomain = ""
    adapter._email = "agent@example.com"
    adapter._api_token = "test-token"
    adapter._base_url_override = base_url
    # Monkey-patch _base_url property for tests
    ZendeskAdapter._base_url_override = base_url
    original_request = ZendeskAdapter._request

    def _patched_request(self, method, path, body):
        self.__class__._base_url_real = self._base_url
        # Use override URL
        import urllib.error
        import urllib.request
        url = base_url + path
        data = json.dumps(body).encode()
        req = urllib.request.Request(
            url, data=data,
            headers={"Content-Type": "application/json", "Authorization": "Basic dGVzdA=="},
            method=method,
        )
        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                return json.loads(resp.read())
        except urllib.error.HTTPError as exc:
            from app.adapters.zendesk import _ZendeskHTTPError
            raise _ZendeskHTTPError(exc.code, exc.read().decode()) from exc

    adapter._request = lambda method, path, body: _patched_request(adapter, method, path, body)
    return adapter


def _make_adapter(base_url: str) -> ZendeskAdapter:
    """Simpler factory — directly patches the instance's _request."""
    return _ZendeskTestAdapter(base_url)


class _ZendeskTestAdapter(ZendeskAdapter):
    def __init__(self, base_url: str) -> None:
        super().__init__(subdomain="fake", email="agent@example.com", api_token="tok")
        self._test_base_url = base_url

    @property
    def _base_url(self) -> str:
        return self._test_base_url


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------


def test_unsupported_action_type():
    adapter = _make_adapter("http://unused")
    action = _action(action_type="apply_discount")
    result = adapter.execute(action)
    assert result.success is False
    assert "does not handle" in (result.error or "")


def test_create_ticket_missing_subject():
    adapter = _make_adapter("http://unused")
    action = _action(body="desc", requester_email="user@example.com")
    result = adapter.execute(action)
    assert result.success is False
    assert "subject" in (result.error or "")


def test_create_ticket_missing_body():
    adapter = _make_adapter("http://unused")
    action = _action(subject="Help", requester_email="user@example.com")
    result = adapter.execute(action)
    assert result.success is False
    assert "body" in (result.error or "")


def test_create_ticket_missing_requester_email():
    adapter = _make_adapter("http://unused")
    action = _action(subject="Help", body="Need help")
    result = adapter.execute(action)
    assert result.success is False
    assert "requester_email" in (result.error or "")


def test_create_ticket_success():
    ticket_response = {
        "ticket": {
            "id": 12345,
            "external_id": "act-zd-1",
            "status": "new",
            "subject": "Urgent issue",
        }
    }
    server, base_url = _make_server([(201, ticket_response)])
    adapter = _make_adapter(base_url)
    action = _action(
        action_id="act-zd-1",
        subject="Urgent issue",
        body="Customer reports login failure",
        requester_email="customer@example.com",
        priority="high",
    )
    result = adapter.execute(action)
    assert result.success is True
    assert result.result["ticket_id"] == 12345
    assert result.result["external_id"] == "act-zd-1"
    assert result.result["status"] == "new"


def test_create_ticket_uses_action_id_as_external_id():
    ticket_response = {"ticket": {"id": 999, "external_id": "statis-abc", "status": "new"}}
    server, base_url = _make_server([(201, ticket_response)])
    adapter = _make_adapter(base_url)
    action = _action(
        action_id="statis-abc",
        subject="Test",
        body="Test body",
        requester_email="user@example.com",
    )
    adapter.execute(action)
    sent = _FakeZendeskHandler.last_request_body
    assert sent["ticket"]["external_id"] == "statis-abc"


def test_update_ticket_success():
    ticket_response = {"ticket": {"id": 12345, "status": "solved"}}
    server, base_url = _make_server([(200, ticket_response)])
    adapter = _make_adapter(base_url)
    action = _action(
        action_id="act-zd-2",
        action_type="zendesk_update_ticket",
        ticket_id=12345,
        status="solved",
        comment="Issue resolved by engineering team.",
    )
    result = adapter.execute(action)
    assert result.success is True
    assert result.result["ticket_id"] == 12345
    assert result.result["status"] == "solved"
    assert result.result["statis_action_id"] == "act-zd-2"


def test_update_ticket_missing_ticket_id():
    adapter = _make_adapter("http://unused")
    action = _action(action_type="zendesk_update_ticket", status="solved")
    result = adapter.execute(action)
    assert result.success is False
    assert "ticket_id" in (result.error or "")


def test_create_ticket_api_error():
    server, base_url = _make_server([(422, {"description": "Validation error"})])
    adapter = _make_adapter(base_url)
    action = _action(subject="Test", body="Test", requester_email="bad-email")
    result = adapter.execute(action)
    assert result.success is False
    assert "422" in (result.error or "")
