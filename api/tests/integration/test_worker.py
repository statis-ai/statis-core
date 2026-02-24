"""Integration tests for the delivery worker: send, retry, and DLQ."""

import json
import sys
import os
import threading
from datetime import datetime, timezone
from http.server import HTTPServer, BaseHTTPRequestHandler

import pytest
from sqlalchemy import select, text
from sqlalchemy.orm import Session

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "..", "worker"))

from app.models.delivery import Delivery
from app.models.subscription import Subscription
from app.models.entity_state import EntityState


class _WebhookHandler(BaseHTTPRequestHandler):
    """Tiny HTTP handler that records requests and returns configurable status codes."""

    received = []
    response_sequence = []  # pop from front; when empty return 200

    def do_POST(self):
        length = int(self.headers.get("Content-Length", 0))
        body = json.loads(self.rfile.read(length)) if length else {}
        _WebhookHandler.received.append(body)

        if _WebhookHandler.response_sequence:
            code = _WebhookHandler.response_sequence.pop(0)
        else:
            code = 200

        self.send_response(code)
        self.end_headers()

    def log_message(self, *args, **kwargs):
        pass


@pytest.fixture()
def webhook_server():
    """Start a tiny HTTP server and yield its URL."""
    _WebhookHandler.received = []
    _WebhookHandler.response_sequence = []
    server = HTTPServer(("127.0.0.1", 0), _WebhookHandler)
    port = server.server_address[1]
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    yield f"http://127.0.0.1:{port}"
    server.shutdown()


def _seed_state_and_delivery(db_session: Session, webhook_url: str, sub_id: str = "sub-w-1"):
    """Insert a subscription, seed event, entity state, and a pending delivery directly."""
    from app.models.event import Event
    from app.models.subscription import Subscription
    from app.models.entity_state import EntityState

    sub = Subscription(
        subscription_id=sub_id,
        tenant_id="test_tenant_w1",
        entity_type="account",
        destination=webhook_url,
        status="active",
    )
    db_session.merge(sub)

    seed_event = Event(
        event_id=f"ev-seed-{sub_id}",
        tenant_id="test_tenant_w1",
        entity_type="account",
        entity_id="acc_w1",
        event_type="ticket.updated",
        payload={"summary": "seed"},
        occurred_at=datetime.now(timezone.utc),
        producer="test",
        schema_version="1",
    )
    db_session.merge(seed_event)
    db_session.flush()

    es = EntityState(
        tenant_id="test_tenant_w1",
        entity_type="account",
        entity_id="acc_w1",
        state={"plan": "pro", "schema_version": "account.v2"},
        state_version=1,
        last_event_id=f"ev-seed-{sub_id}",
        last_occurred_at=datetime.now(timezone.utc),
        state_hash="abc123",
        provenance_event_ids=[f"ev-seed-{sub_id}"],
    )
    db_session.merge(es)
    db_session.flush()

    return sub, es


def _insert_delivery(db_session, sub_id, entity_id="acc_w1", state_version=1, dedupe_suffix=""):
    import uuid
    d = Delivery(
        delivery_id=str(uuid.uuid4()),
        tenant_id="test_tenant_w1",
        subscription_id=sub_id,
        entity_type="account",
        entity_id=entity_id,
        state_version=state_version,
        dedupe_key=f"test_tenant_w1:{sub_id}:account:{entity_id}:{state_version}{dedupe_suffix}",
        status="pending",
        attempt_count=0,
    )
    db_session.add(d)
    db_session.flush()
    return d


@pytest.mark.integration
class TestWorkerSend:
    def test_successful_delivery(self, db_session, webhook_server):
        from deliver import fetch_pending, process_delivery

        sub, es = _seed_state_and_delivery(db_session, webhook_server)
        delivery = _insert_delivery(db_session, sub.subscription_id)
        db_session.commit()

        deliveries = fetch_pending(db_session)
        assert len(deliveries) >= 1

        process_delivery(db_session, deliveries[0])
        db_session.commit()

        db_session.refresh(delivery)
        assert delivery.status == "sent"
        assert delivery.response_code == 200
        assert delivery.sent_at is not None

        assert len(_WebhookHandler.received) == 1
        payload = _WebhookHandler.received[0]
        assert payload["entity_type"] == "account"
        assert payload["entity_id"] == "acc_w1"
        assert payload["state_version"] == 1
        assert "state" in payload
        assert "state_hash" in payload

    def test_retry_then_success(self, db_session, webhook_server):
        from deliver import fetch_pending, process_delivery

        _WebhookHandler.response_sequence = [500, 500]  # fail twice, then 200

        sub, es = _seed_state_and_delivery(db_session, webhook_server, sub_id="sub-w-retry")
        delivery = _insert_delivery(db_session, "sub-w-retry", dedupe_suffix="-retry")
        db_session.commit()

        # Attempt 1 — should fail
        deliveries = fetch_pending(db_session)
        process_delivery(db_session, deliveries[0])
        db_session.commit()

        db_session.refresh(delivery)
        assert delivery.status == "failed"
        assert delivery.attempt_count == 1

        # Force next_attempt_at to now so it's immediately eligible
        delivery.next_attempt_at = datetime.now(timezone.utc)
        db_session.commit()

        # Attempt 2 — should fail again
        deliveries = fetch_pending(db_session)
        process_delivery(db_session, deliveries[0])
        db_session.commit()

        db_session.refresh(delivery)
        assert delivery.status == "failed"
        assert delivery.attempt_count == 2

        delivery.next_attempt_at = datetime.now(timezone.utc)
        db_session.commit()

        # Attempt 3 — should succeed (response_sequence is empty → 200)
        deliveries = fetch_pending(db_session)
        process_delivery(db_session, deliveries[0])
        db_session.commit()

        db_session.refresh(delivery)
        assert delivery.status == "sent"
        assert delivery.attempt_count == 2  # only failures count
        assert delivery.response_code == 200

    def test_dlq_after_max_attempts(self, db_session, webhook_server):
        from deliver import fetch_pending, process_delivery, MAX_ATTEMPTS

        _WebhookHandler.response_sequence = [500] * (MAX_ATTEMPTS + 1)

        sub, es = _seed_state_and_delivery(db_session, webhook_server, sub_id="sub-w-dlq")
        delivery = _insert_delivery(db_session, "sub-w-dlq", dedupe_suffix="-dlq")
        db_session.commit()

        for i in range(MAX_ATTEMPTS):
            delivery.next_attempt_at = datetime.now(timezone.utc)
            db_session.commit()

            deliveries = fetch_pending(db_session)
            assert len(deliveries) >= 1, f"No pending deliveries at attempt {i+1}"
            process_delivery(db_session, deliveries[0])
            db_session.commit()
            db_session.refresh(delivery)

        assert delivery.status == "dead"
        assert delivery.attempt_count == MAX_ATTEMPTS
