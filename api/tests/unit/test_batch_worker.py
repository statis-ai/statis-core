"""Unit tests for batch worker concurrent delivery."""
import os
import sys
from datetime import datetime, timezone
from typing import Optional
from unittest.mock import MagicMock

import httpx
import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "..", "worker"))


def _fake_delivery(
    delivery_id: str = "d_1",
    tenant_id: str = "t_1",
    subscription_id: str = "sub_1",
    entity_type: str = "account",
    entity_id: str = "acc_1",
    state_version: int = 1,
    status: str = "pending",
    attempt_count: int = 0,
) -> MagicMock:
    d = MagicMock()
    d.delivery_id = delivery_id
    d.tenant_id = tenant_id
    d.subscription_id = subscription_id
    d.entity_type = entity_type
    d.entity_id = entity_id
    d.state_version = state_version
    d.status = status
    d.attempt_count = attempt_count
    d.last_error = None
    d.response_code = None
    d.sent_at = None
    d.next_attempt_at = datetime.now(timezone.utc)
    return d


def _fake_subscription(
    subscription_id: str = "sub_1",
    destination: str = "https://hook.example.com",
    status: str = "active",
) -> MagicMock:
    s = MagicMock()
    s.subscription_id = subscription_id
    s.destination = destination
    s.status = status
    return s


def _fake_entity_state(
    state: Optional[dict] = None, state_hash: str = "abc123"
) -> MagicMock:
    es = MagicMock()
    es.state = state or {"plan": "pro"}
    es.state_hash = state_hash
    es.tenant_id = "t_1"
    es.entity_type = "account"
    es.entity_id = "acc_1"
    return es


class TestProcessBatch:
    """Tests for the concurrent process_batch function."""

    def test_batch_delivers_all(self):
        from deliver import process_batch

        deliveries = [_fake_delivery(delivery_id=f"d_{i}") for i in range(5)]
        sub = _fake_subscription()
        entity = _fake_entity_state()

        db = MagicMock()
        db.get.return_value = sub
        scalar_mock = MagicMock()
        scalar_mock.scalar_one_or_none.return_value = entity
        db.execute.return_value = scalar_mock

        transport = httpx.MockTransport(
            lambda request: httpx.Response(200, json={"ok": True})
        )
        client = httpx.Client(transport=transport)

        process_batch(db, deliveries, http_client=client)
        client.close()

        for d in deliveries:
            assert d.status == "sent"
            assert d.response_code == 200

    def test_batch_handles_http_failure(self):
        from deliver import process_batch

        delivery = _fake_delivery()
        sub = _fake_subscription()
        entity = _fake_entity_state()

        db = MagicMock()
        db.get.return_value = sub
        scalar_mock = MagicMock()
        scalar_mock.scalar_one_or_none.return_value = entity
        db.execute.return_value = scalar_mock

        transport = httpx.MockTransport(
            lambda request: httpx.Response(500, text="Internal Server Error")
        )
        client = httpx.Client(transport=transport)

        process_batch(db, [delivery], http_client=client)
        client.close()

        assert delivery.status == "failed"
        assert delivery.response_code == 500

    def test_batch_skips_dead_subscription(self):
        from deliver import process_batch

        delivery = _fake_delivery()

        db = MagicMock()
        db.get.return_value = None

        process_batch(db, [delivery])

        assert delivery.status == "dead"
        assert "missing" in delivery.last_error

    def test_batch_skips_missing_entity_state(self):
        from deliver import process_batch

        delivery = _fake_delivery()
        sub = _fake_subscription()

        db = MagicMock()
        db.get.return_value = sub
        scalar_mock = MagicMock()
        scalar_mock.scalar_one_or_none.return_value = None
        db.execute.return_value = scalar_mock

        process_batch(db, [delivery])

        assert delivery.status == "dead"
        assert "entity state" in delivery.last_error


class TestSendWebhook:
    """Tests for the _send_webhook helper."""

    def test_success_returns_status_and_no_error(self):
        from deliver import _send_webhook

        transport = httpx.MockTransport(
            lambda request: httpx.Response(200, json={"ok": True})
        )
        client = httpx.Client(transport=transport)
        code, err = _send_webhook(client, "https://example.com/hook", {"data": 1})
        client.close()

        assert code == 200
        assert err is None

    def test_http_error_returns_error_string(self):
        from deliver import _send_webhook

        transport = httpx.MockTransport(
            lambda request: httpx.Response(503, text="Unavailable")
        )
        client = httpx.Client(transport=transport)
        code, err = _send_webhook(client, "https://example.com/hook", {"data": 1})
        client.close()

        assert code == 503
        assert "HTTP 503" in err

    def test_connection_error_returns_none_code(self):
        from deliver import _send_webhook

        def raise_err(request):
            raise httpx.ConnectError("refused")

        transport = httpx.MockTransport(raise_err)
        client = httpx.Client(transport=transport)
        code, err = _send_webhook(client, "https://example.com/hook", {"data": 1})
        client.close()

        assert code is None
        assert err is not None
