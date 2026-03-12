"""Unit tests for AirflowAdapter."""
from __future__ import annotations

import json
from http.server import BaseHTTPRequestHandler, HTTPServer
from threading import Thread
from typing import Any
from unittest.mock import MagicMock

import pytest

from app.adapters.airflow import AirflowAdapter


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _action(
    action_id: str = "act-1",
    action_type: str = "airflow_dag_trigger",
    dag_id: str = "my_dag",
    conf: dict | None = None,
    logical_date: str | None = None,
) -> MagicMock:
    m = MagicMock()
    m.action_id = action_id
    m.action_type = action_type
    m.parameters = {"dag_id": dag_id}
    if conf is not None:
        m.parameters["conf"] = conf
    if logical_date is not None:
        m.parameters["logical_date"] = logical_date
    return m


# ---------------------------------------------------------------------------
# Tiny in-process HTTP server for realistic tests (no httpretty / respx)
# ---------------------------------------------------------------------------


class _FakeAirflowHandler(BaseHTTPRequestHandler):
    responses: list[tuple[int, dict]] = []  # set per test via class variable

    def log_message(self, *args: Any) -> None:  # silence request logs
        pass

    def do_POST(self) -> None:
        length = int(self.headers.get("Content-Length", 0))
        body = json.loads(self.rfile.read(length))
        type(self).last_request_body = body  # stash for assertions

        status, resp_body = type(self).responses.pop(0)
        payload = json.dumps(resp_body).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)


def _make_server(responses: list[tuple[int, dict]]) -> tuple[HTTPServer, str]:
    _FakeAirflowHandler.responses = list(responses)
    _FakeAirflowHandler.last_request_body = {}
    server = HTTPServer(("127.0.0.1", 0), _FakeAirflowHandler)
    port = server.server_address[1]
    t = Thread(target=server.handle_request)  # serve exactly one request
    t.daemon = True
    t.start()
    return server, f"http://127.0.0.1:{port}"


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------


def test_unsupported_action_type():
    adapter = AirflowAdapter(base_url="http://unused", username="u", password="p")
    action = _action(action_type="apply_discount")
    result = adapter.execute(action)
    assert result.success is False
    assert "does not handle" in (result.error or "")


def test_missing_dag_id():
    adapter = AirflowAdapter(base_url="http://unused", username="u", password="p")
    m = MagicMock()
    m.action_id = "act-1"
    m.action_type = "airflow_dag_trigger"
    m.parameters = {}  # no dag_id
    result = adapter.execute(m)
    assert result.success is False
    assert "dag_id" in (result.error or "")


def test_successful_trigger():
    dag_run_response = {
        "dag_run_id": "act-1",
        "dag_id": "my_dag",
        "state": "queued",
        "logical_date": "2026-03-11T00:00:00+00:00",
    }
    server, base_url = _make_server([(200, dag_run_response)])

    adapter = AirflowAdapter(base_url=base_url, username="admin", password="admin")
    action = _action(action_id="act-1", dag_id="my_dag")
    result = adapter.execute(action)

    assert result.success is True
    assert result.result["dag_run_id"] == "act-1"
    assert result.result["dag_id"] == "my_dag"
    assert result.result["state"] == "queued"
    assert result.error is None


def test_action_id_used_as_dag_run_id():
    """The action_id must appear as dag_run_id in the POST body (idempotency key)."""
    dag_run_response = {"dag_run_id": "statis-abc", "dag_id": "etl_dag", "state": "queued", "logical_date": "2026-03-11T00:00:00+00:00"}
    server, base_url = _make_server([(200, dag_run_response)])

    adapter = AirflowAdapter(base_url=base_url, username="u", password="p")
    action = _action(action_id="statis-abc", dag_id="etl_dag")
    adapter.execute(action)

    sent = _FakeAirflowHandler.last_request_body
    assert sent["dag_run_id"] == "statis-abc"


def test_conf_forwarded():
    dag_run_response = {"dag_run_id": "act-1", "dag_id": "etl_dag", "state": "queued", "logical_date": "2026-03-11T00:00:00+00:00"}
    server, base_url = _make_server([(200, dag_run_response)])

    adapter = AirflowAdapter(base_url=base_url, username="u", password="p")
    action = _action(dag_id="etl_dag", conf={"customer_id": "cust-99"})
    adapter.execute(action)

    sent = _FakeAirflowHandler.last_request_body
    assert sent["conf"] == {"customer_id": "cust-99"}


def test_409_idempotent_success():
    """A 409 from Airflow (duplicate dag_run_id) should be treated as success."""
    server, base_url = _make_server([(409, {"detail": "dag_run already exists"})])

    adapter = AirflowAdapter(base_url=base_url, username="u", password="p")
    action = _action(action_id="act-dup", dag_id="my_dag")
    result = adapter.execute(action)

    assert result.success is True
    assert result.result["state"] == "already_exists"
    assert result.result["dag_run_id"] == "act-dup"


def test_500_returns_failure():
    server, base_url = _make_server([(500, {"detail": "internal error"})])

    adapter = AirflowAdapter(base_url=base_url, username="u", password="p")
    action = _action(dag_id="my_dag")
    result = adapter.execute(action)

    assert result.success is False
    assert "500" in (result.error or "")
