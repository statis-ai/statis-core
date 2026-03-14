"""Unit tests for SalesforceAdapter."""
from __future__ import annotations

import json
from http.server import BaseHTTPRequestHandler, HTTPServer
from threading import Thread
from typing import Any
from unittest.mock import MagicMock

import pytest

from app.adapters.salesforce import SalesforceAdapter


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _action(
    action_id: str = "act-1",
    action_type: str = "salesforce_update_record",
    **params,
) -> MagicMock:
    m = MagicMock()
    m.action_id = action_id
    m.action_type = action_type
    m.parameters = params
    return m


class _FakeSalesforceHandler(BaseHTTPRequestHandler):
    responses: list[tuple[int, dict | None]] = []
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
        if resp_body is None:
            # 204 No Content
            self.send_response(status)
            self.end_headers()
        else:
            payload = json.dumps(resp_body).encode()
            self.send_response(status)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(payload)))
            self.end_headers()
            self.wfile.write(payload)

    do_PATCH = _handle
    do_POST = _handle


def _make_server(responses: list[tuple[int, dict | None]]) -> tuple[HTTPServer, str]:
    _FakeSalesforceHandler.responses = list(responses)
    _FakeSalesforceHandler.last_request_body = {}
    _FakeSalesforceHandler.last_request_method = ""
    server = HTTPServer(("127.0.0.1", 0), _FakeSalesforceHandler)
    port = server.server_address[1]
    t = Thread(target=server.handle_request)
    t.daemon = True
    t.start()
    return server, f"http://127.0.0.1:{port}"


def _adapter(base_url: str) -> SalesforceAdapter:
    return SalesforceAdapter(instance_url=base_url, access_token="test-token")


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------


def test_unsupported_action_type():
    adapter = _adapter("http://unused")
    action = _action(action_type="apply_discount")
    result = adapter.execute(action)
    assert result.success is False
    assert "does not handle" in (result.error or "")


def test_update_record_missing_object_type():
    adapter = _adapter("http://unused")
    action = _action(record_id="003xx", fields={"Title": "CEO"})
    result = adapter.execute(action)
    assert result.success is False
    assert "object_type" in (result.error or "")


def test_update_record_missing_record_id():
    adapter = _adapter("http://unused")
    action = _action(object_type="Contact", fields={"Title": "CEO"})
    result = adapter.execute(action)
    assert result.success is False
    assert "record_id" in (result.error or "")


def test_update_record_success():
    server, base_url = _make_server([(204, None)])  # Salesforce PATCH returns 204
    adapter = _adapter(base_url)
    action = _action(
        action_id="act-sf-1",
        object_type="Contact",
        record_id="003xx000001ABC",
        fields={"Title": "CEO", "Department": "Executive"},
    )
    result = adapter.execute(action)
    assert result.success is True
    assert result.result["object_type"] == "Contact"
    assert result.result["record_id"] == "003xx000001ABC"
    assert result.result["action"] == "updated"
    assert result.result["statis_action_id"] == "act-sf-1"
    assert _FakeSalesforceHandler.last_request_method == "PATCH"


def test_update_record_injects_bearer_token():
    server, base_url = _make_server([(204, None)])
    adapter = SalesforceAdapter(instance_url=base_url, access_token="my-secret-token")
    action = _action(object_type="Contact", record_id="003xx", fields={"Title": "VP"})
    adapter.execute(action)
    # If we got here without error, auth was accepted by the fake server


def test_create_record_success():
    server, base_url = _make_server([(201, {"id": "003newABC", "success": True, "errors": []})])
    adapter = _adapter(base_url)
    action = _action(
        action_id="act-sf-2",
        action_type="salesforce_create_record",
        object_type="Lead",
        fields={"FirstName": "Jane", "LastName": "Doe", "Company": "Acme"},
    )
    result = adapter.execute(action)
    assert result.success is True
    assert result.result["record_id"] == "003newABC"
    assert result.result["action"] == "created"
    assert result.result["statis_action_id"] == "act-sf-2"


def test_create_record_injects_action_id_as_external_key():
    server, base_url = _make_server([(201, {"id": "003newXYZ", "success": True, "errors": []})])
    adapter = _adapter(base_url)
    action = _action(
        action_id="statis-idempotency-key",
        action_type="salesforce_create_record",
        object_type="Contact",
        fields={"FirstName": "Test"},
    )
    adapter.execute(action)
    sent = _FakeSalesforceHandler.last_request_body
    assert sent.get("Statis_Action_Id__c") == "statis-idempotency-key"


def test_update_record_api_error():
    server, base_url = _make_server([(404, {"message": "Record not found"})])
    adapter = _adapter(base_url)
    action = _action(object_type="Contact", record_id="bad-id", fields={"Title": "X"})
    result = adapter.execute(action)
    assert result.success is False
    assert "404" in (result.error or "")
