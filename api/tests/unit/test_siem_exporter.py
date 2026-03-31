"""Unit tests for SIEMExporter (P-26)."""
from __future__ import annotations

import json
from datetime import datetime, timezone
from types import SimpleNamespace
from unittest.mock import MagicMock, patch

import pytest

from app.security.siem_exporter import SIEMExporter


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------


def _make_action(**kwargs):
    defaults = dict(
        tenant_id="tenant-abc",
        action_id="action-123",
        action_type="charge_customer",
        target_system="stripe",
        status="COMPLETED",
        mode="live",
    )
    defaults.update(kwargs)
    return SimpleNamespace(**defaults)


def _make_receipt(**kwargs):
    defaults = dict(
        receipt_id="receipt-xyz",
        decision="APPROVED",
        hash="abc123",
        created_at=datetime(2026, 1, 1, 12, 0, 0, tzinfo=timezone.utc),
    )
    defaults.update(kwargs)
    return SimpleNamespace(**defaults)


# ---------------------------------------------------------------------------
# Datadog
# ---------------------------------------------------------------------------


def test_datadog_export_fires_correct_http_call(monkeypatch):
    monkeypatch.setenv("SIEM_DATADOG_ENABLED", "true")
    monkeypatch.setenv("SIEM_DATADOG_API_KEY", "dd-key-abc")
    monkeypatch.setenv("SIEM_DATADOG_HOST", "https://http-intake.logs.datadoghq.com")
    monkeypatch.delenv("SIEM_SPLUNK_ENABLED", raising=False)

    mock_resp = MagicMock()
    mock_resp.status_code = 200

    with patch("httpx.post", return_value=mock_resp) as mock_post:
        SIEMExporter().export(_make_action(), _make_receipt())

    mock_post.assert_called_once()
    call_kwargs = mock_post.call_args

    url = call_kwargs.args[0] if call_kwargs.args else call_kwargs.kwargs.get("url", call_kwargs.args[0])
    assert "http-intake.logs.datadoghq.com" in url
    assert "/api/v2/logs" in url

    headers = call_kwargs.kwargs.get("headers", {})
    assert headers.get("DD-API-KEY") == "dd-key-abc"

    payload = call_kwargs.kwargs.get("json", [])
    assert isinstance(payload, list)
    assert len(payload) == 1
    item = payload[0]
    assert item["ddsource"] == "statis"
    assert item["service"] == "statis-receipts"

    event = json.loads(item["message"])
    assert event["action_id"] == "action-123"
    assert event["tenant_id"] == "tenant-abc"
    assert event["receipt_id"] == "receipt-xyz"
    assert event["decision"] == "APPROVED"
    assert event["service"] == "statis"


def test_datadog_uses_custom_host(monkeypatch):
    monkeypatch.setenv("SIEM_DATADOG_ENABLED", "true")
    monkeypatch.setenv("SIEM_DATADOG_API_KEY", "key")
    monkeypatch.setenv("SIEM_DATADOG_HOST", "https://custom.dd.host")
    monkeypatch.delenv("SIEM_SPLUNK_ENABLED", raising=False)

    mock_resp = MagicMock()
    mock_resp.status_code = 200

    with patch("httpx.post", return_value=mock_resp) as mock_post:
        SIEMExporter().export(_make_action(), _make_receipt())

    url = mock_post.call_args.args[0]
    assert url == "https://custom.dd.host/api/v2/logs"


# ---------------------------------------------------------------------------
# Splunk
# ---------------------------------------------------------------------------


def test_splunk_export_fires_correct_http_call(monkeypatch):
    monkeypatch.delenv("SIEM_DATADOG_ENABLED", raising=False)
    monkeypatch.setenv("SIEM_SPLUNK_ENABLED", "true")
    monkeypatch.setenv("SIEM_SPLUNK_HEC_URL", "https://splunk.example.com:8088")
    monkeypatch.setenv("SIEM_SPLUNK_HEC_TOKEN", "splunk-token-xyz")

    mock_resp = MagicMock()
    mock_resp.status_code = 200

    with patch("httpx.post", return_value=mock_resp) as mock_post:
        SIEMExporter().export(_make_action(), _make_receipt())

    mock_post.assert_called_once()
    call_kwargs = mock_post.call_args

    url = call_kwargs.args[0]
    assert "splunk.example.com" in url
    assert "/services/collector/event" in url

    headers = call_kwargs.kwargs.get("headers", {})
    assert headers.get("Authorization") == "Splunk splunk-token-xyz"

    payload = call_kwargs.kwargs.get("json", {})
    assert payload["sourcetype"] == "statis:receipt"
    event = payload["event"]
    assert event["action_id"] == "action-123"
    assert event["receipt_id"] == "receipt-xyz"


# ---------------------------------------------------------------------------
# Disabled exporters make no HTTP calls
# ---------------------------------------------------------------------------


def test_disabled_exporters_make_no_http_calls(monkeypatch):
    monkeypatch.setenv("SIEM_DATADOG_ENABLED", "false")
    monkeypatch.setenv("SIEM_SPLUNK_ENABLED", "false")

    with patch("httpx.post") as mock_post:
        SIEMExporter().export(_make_action(), _make_receipt())

    mock_post.assert_not_called()


def test_exporters_off_by_default(monkeypatch):
    monkeypatch.delenv("SIEM_DATADOG_ENABLED", raising=False)
    monkeypatch.delenv("SIEM_SPLUNK_ENABLED", raising=False)

    with patch("httpx.post") as mock_post:
        SIEMExporter().export(_make_action(), _make_receipt())

    mock_post.assert_not_called()


# ---------------------------------------------------------------------------
# Failure isolation — one exporter failing doesn't prevent the other
# ---------------------------------------------------------------------------


def test_datadog_failure_does_not_prevent_splunk(monkeypatch):
    monkeypatch.setenv("SIEM_DATADOG_ENABLED", "true")
    monkeypatch.setenv("SIEM_DATADOG_API_KEY", "key")
    monkeypatch.setenv("SIEM_SPLUNK_ENABLED", "true")
    monkeypatch.setenv("SIEM_SPLUNK_HEC_URL", "https://splunk.example.com:8088")
    monkeypatch.setenv("SIEM_SPLUNK_HEC_TOKEN", "token")

    call_urls: list[str] = []

    def fake_post(url, **kwargs):
        call_urls.append(url)
        if "datadoghq" in url:
            raise ConnectionError("DD unreachable")
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        return mock_resp

    with patch("httpx.post", side_effect=fake_post):
        # Should not raise
        SIEMExporter().export(_make_action(), _make_receipt())

    splunk_calls = [u for u in call_urls if "splunk" in u]
    assert len(splunk_calls) == 1, "Splunk should still have been called after Datadog failure"


def test_splunk_failure_does_not_prevent_datadog(monkeypatch):
    monkeypatch.setenv("SIEM_DATADOG_ENABLED", "true")
    monkeypatch.setenv("SIEM_DATADOG_API_KEY", "key")
    monkeypatch.setenv("SIEM_SPLUNK_ENABLED", "true")
    monkeypatch.setenv("SIEM_SPLUNK_HEC_URL", "https://splunk.example.com:8088")
    monkeypatch.setenv("SIEM_SPLUNK_HEC_TOKEN", "token")

    call_urls: list[str] = []

    def fake_post(url, **kwargs):
        call_urls.append(url)
        if "splunk" in url:
            raise ConnectionError("Splunk unreachable")
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        return mock_resp

    with patch("httpx.post", side_effect=fake_post):
        SIEMExporter().export(_make_action(), _make_receipt())

    dd_calls = [u for u in call_urls if "datadoghq" in u]
    assert len(dd_calls) == 1, "Datadog should have been called regardless of Splunk failure"
