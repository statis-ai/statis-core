"""Unit tests for HubSpotAdapter."""
from __future__ import annotations

import json
from http.server import BaseHTTPRequestHandler, HTTPServer
from threading import Thread
from typing import Any
from unittest.mock import MagicMock

from app.adapters.hubspot import HubSpotAdapter, _HubSpotHTTPError


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _action(
    action_id: str = "act-1",
    action_type: str = "hubspot_update_contact",
    **params,
) -> MagicMock:
    m = MagicMock()
    m.action_id = action_id
    m.action_type = action_type
    m.parameters = params
    return m


class _FakeHubSpotHandler(BaseHTTPRequestHandler):
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

    do_PATCH = _handle
    do_POST = _handle


def _make_server(responses: list[tuple[int, dict]]) -> tuple[HTTPServer, str]:
    _FakeHubSpotHandler.responses = list(responses)
    _FakeHubSpotHandler.last_request_body = {}
    _FakeHubSpotHandler.last_request_method = ""
    server = HTTPServer(("127.0.0.1", 0), _FakeHubSpotHandler)
    port = server.server_address[1]
    t = Thread(target=server.handle_request)
    t.daemon = True
    t.start()
    return server, f"http://127.0.0.1:{port}"


class _HubSpotTestAdapter(HubSpotAdapter):
    """Subclass that overrides the hardcoded _BASE_URL for tests."""

    def __init__(self, base_url: str) -> None:
        super().__init__(access_token="test-token")
        self._test_base_url = base_url

    def _request(self, method: str, path: str, body: dict) -> dict:
        import urllib.error
        import urllib.request
        url = self._test_base_url + path
        data = json.dumps(body).encode()
        req = urllib.request.Request(
            url, data=data,
            headers={"Content-Type": "application/json", "Authorization": "Bearer test-token"},
            method=method,
        )
        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                raw = resp.read()
                return json.loads(raw) if raw else {}
        except urllib.error.HTTPError as exc:
            raise _HubSpotHTTPError(exc.code, exc.read().decode()) from exc


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------


def test_unsupported_action_type():
    adapter = _HubSpotTestAdapter("http://unused")
    action = _action(action_type="apply_discount")
    result = adapter.execute(action)
    assert result.success is False
    assert "does not handle" in (result.error or "")


def test_update_contact_missing_contact_id():
    adapter = _HubSpotTestAdapter("http://unused")
    action = _action(properties={"email": "new@example.com"})
    result = adapter.execute(action)
    assert result.success is False
    assert "contact_id" in (result.error or "")


def test_update_contact_missing_properties():
    adapter = _HubSpotTestAdapter("http://unused")
    action = _action(contact_id="123")
    result = adapter.execute(action)
    assert result.success is False
    assert "properties" in (result.error or "")


def test_update_contact_success():
    contact_response = {"id": "123", "properties": {"email": "updated@example.com"}}
    server, base_url = _make_server([(200, contact_response)])
    adapter = _HubSpotTestAdapter(base_url)
    action = _action(
        action_id="act-hs-1",
        contact_id="123",
        properties={"email": "updated@example.com", "lifecyclestage": "customer"},
    )
    result = adapter.execute(action)
    assert result.success is True
    assert result.result["contact_id"] == "123"
    assert result.result["action"] == "updated"
    assert result.result["statis_action_id"] == "act-hs-1"
    assert set(result.result["updated_properties"]) == {"email", "lifecyclestage"}
    assert _FakeHubSpotHandler.last_request_method == "PATCH"


def test_create_deal_missing_deal_name():
    adapter = _HubSpotTestAdapter("http://unused")
    action = _action(action_type="hubspot_create_deal", pipeline="default", stage="appointmentscheduled")
    result = adapter.execute(action)
    assert result.success is False
    assert "deal_name" in (result.error or "")


def test_create_deal_success():
    deal_response = {"id": "456", "properties": {"dealname": "Acme Enterprise Deal"}}
    server, base_url = _make_server([(201, deal_response)])
    adapter = _HubSpotTestAdapter(base_url)
    action = _action(
        action_id="act-hs-2",
        action_type="hubspot_create_deal",
        deal_name="Acme Enterprise Deal",
        pipeline="default",
        stage="appointmentscheduled",
        amount=50000,
    )
    result = adapter.execute(action)
    assert result.success is True
    assert result.result["deal_id"] == "456"
    assert result.result["deal_name"] == "Acme Enterprise Deal"
    assert result.result["action"] == "created"
    assert result.result["statis_action_id"] == "act-hs-2"


def test_create_deal_injects_unique_creation_key():
    deal_response = {"id": "789", "properties": {}}
    server, base_url = _make_server([(201, deal_response)])
    adapter = _HubSpotTestAdapter(base_url)
    action = _action(
        action_id="statis-idempotency-key",
        action_type="hubspot_create_deal",
        deal_name="Test Deal",
        pipeline="default",
        stage="appointmentscheduled",
    )
    adapter.execute(action)
    sent = _FakeHubSpotHandler.last_request_body
    assert sent["properties"]["hs_unique_creation_key"] == "statis-idempotency-key"


def test_create_deal_409_idempotent():
    server, base_url = _make_server([(409, {"message": "Deal already exists"})])
    adapter = _HubSpotTestAdapter(base_url)
    action = _action(
        action_id="act-dup",
        action_type="hubspot_create_deal",
        deal_name="Duplicate Deal",
        pipeline="default",
        stage="appointmentscheduled",
    )
    result = adapter.execute(action)
    assert result.success is True
    assert result.result["action"] == "already_exists"
    assert result.result["statis_action_id"] == "act-dup"


def test_update_contact_api_error():
    server, base_url = _make_server([(404, {"message": "Contact not found"})])
    adapter = _HubSpotTestAdapter(base_url)
    action = _action(contact_id="bad-id", properties={"email": "x@x.com"})
    result = adapter.execute(action)
    assert result.success is False
    assert "404" in (result.error or "")
