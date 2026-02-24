"""Unit tests for _enqueue_deliveries logic."""

from unittest.mock import MagicMock, patch, call
import uuid

import pytest

from app.models.entity_state import EntityState
from app.models.subscription import Subscription
from app.repositories.events import _enqueue_deliveries


def _make_entity_state(entity_type="account", entity_id="acc_1", state_version=3, tenant_id="test_tenant_1"):
    es = MagicMock(spec=EntityState)
    es.entity_type = entity_type
    es.entity_id = entity_id
    es.state_version = state_version
    es.tenant_id = tenant_id
    return es


def _make_subscription(sub_id=None, entity_type="account", event_types=None, status="active", tenant_id="test_tenant_1"):
    sub = MagicMock(spec=Subscription)
    sub.subscription_id = sub_id or str(uuid.uuid4())
    sub.entity_type = entity_type
    sub.event_types = event_types
    sub.status = status
    sub.tenant_id = tenant_id
    return sub


class TestEnqueueDeliveries:
    def test_matching_subscription_creates_delivery(self):
        sub = _make_subscription(sub_id="sub-1")
        es = _make_entity_state()

        db = MagicMock()
        db.execute.return_value.scalars.return_value.all.return_value = [sub]

        _enqueue_deliveries(db, es, "ticket.updated", "test_tenant_1")

        # 2 execute calls: 1 for SELECT subscriptions + 1 for INSERT delivery
        assert db.execute.call_count == 2

    def test_event_type_filter_skips_non_matching(self):
        sub = _make_subscription(sub_id="sub-1", event_types=["plan.changed"])
        es = _make_entity_state()

        db = MagicMock()
        db.execute.return_value.scalars.return_value.all.return_value = [sub]

        _enqueue_deliveries(db, es, "ticket.updated", "test_tenant_1")

        # Only the SELECT, no INSERT
        assert db.execute.call_count == 1

    def test_event_type_filter_matches(self):
        sub = _make_subscription(sub_id="sub-1", event_types=["ticket.updated"])
        es = _make_entity_state()

        db = MagicMock()
        db.execute.return_value.scalars.return_value.all.return_value = [sub]

        _enqueue_deliveries(db, es, "ticket.updated", "test_tenant_1")

        assert db.execute.call_count == 2

    def test_null_event_types_matches_all(self):
        sub = _make_subscription(sub_id="sub-1", event_types=None)
        es = _make_entity_state()

        db = MagicMock()
        db.execute.return_value.scalars.return_value.all.return_value = [sub]

        _enqueue_deliveries(db, es, "anything.goes", "test_tenant_1")

        assert db.execute.call_count == 2

    def test_dedupe_key_format(self):
        sub = _make_subscription(sub_id="sub-99")
        es = _make_entity_state(entity_type="account", entity_id="acc_7", state_version=5)

        db = MagicMock()
        db.execute.return_value.scalars.return_value.all.return_value = [sub]

        _enqueue_deliveries(db, es, "ticket.updated", "test_tenant_1")

        insert_call = db.execute.call_args_list[1]
        stmt = insert_call[0][0]
        compiled = stmt.compile(compile_kwargs={"literal_binds": True})
        compiled_str = str(compiled)
        assert "test_tenant_1:sub-99:account:acc_7:5" in compiled_str

    def test_no_subscriptions_no_inserts(self):
        es = _make_entity_state()

        db = MagicMock()
        db.execute.return_value.scalars.return_value.all.return_value = []

        _enqueue_deliveries(db, es, "ticket.updated", "test_tenant_1")

        assert db.execute.call_count == 1

    def test_multiple_subscriptions(self):
        sub1 = _make_subscription(sub_id="sub-1")
        sub2 = _make_subscription(sub_id="sub-2")
        es = _make_entity_state()

        db = MagicMock()
        db.execute.return_value.scalars.return_value.all.return_value = [sub1, sub2]

        _enqueue_deliveries(db, es, "ticket.updated", "test_tenant_1")

        # 1 SELECT + 2 INSERTs
        assert db.execute.call_count == 3
