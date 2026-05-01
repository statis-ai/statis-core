"""Unit tests for the new receipts list + by-id endpoints.

Covers:
  GET /receipts            — list with optional ?rule_id= filter
  GET /receipts/by-id/{id} — fetch by receipt primary key
"""
from __future__ import annotations

from datetime import datetime, timezone
from unittest.mock import MagicMock

import pytest
from fastapi.testclient import TestClient

from app.api.deps import AuthContext, get_auth_context
from app.db.session import get_db
from app.main import app

TENANT_ID = "tenant-receipt-tests"
FAKE_AUTH = AuthContext(tenant_id=TENANT_ID, role="admin")


def _make_receipt(
    receipt_id: str = "rec-001",
    action_id: str = "act-001",
    decision: str = "APPROVED",
    rule_id: str | None = "policy-v1",
) -> MagicMock:
    r = MagicMock()
    r.receipt_id = receipt_id
    r.action_id = action_id
    r.decision = decision
    r.rule_id = rule_id
    r.rule_version = "1"
    r.approved_by = "policy_engine"
    r.executed_at = None
    r.execution_result = None
    r.hash = "a" * 64
    r.signature = None
    r.signature_alg = None
    r.public_key_id = None
    r.conditions_evaluated = None
    r.entity_state_snapshot = None
    r.created_at = datetime(2026, 4, 1, tzinfo=timezone.utc)
    return r


def _make_contract(action_id: str = "act-001", tenant_id: str = TENANT_ID) -> MagicMock:
    c = MagicMock()
    c.action_id = action_id
    c.tenant_id = tenant_id
    return c


@pytest.fixture()
def client_and_db():
    mock_db = MagicMock()
    app.dependency_overrides[get_db] = lambda: mock_db
    app.dependency_overrides[get_auth_context] = lambda: FAKE_AUTH
    with TestClient(app, raise_server_exceptions=True) as c:
        yield c, mock_db
    app.dependency_overrides.clear()


# ---------------------------------------------------------------------------
# GET /receipts
# ---------------------------------------------------------------------------


def test_list_receipts_returns_200(client_and_db):
    client, db = client_and_db
    receipts = [_make_receipt("rec-001"), _make_receipt("rec-002", action_id="act-002")]

    q = db.query.return_value.join.return_value.filter.return_value
    q.order_by.return_value.limit.return_value.all.return_value = receipts

    resp = client.get("/receipts", headers={"X-API-Key": "test-key"})

    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 2
    assert data[0]["receipt_id"] == "rec-001"
    assert data[1]["receipt_id"] == "rec-002"


def test_list_receipts_filters_by_rule_id(client_and_db):
    client, db = client_and_db
    receipts = [_make_receipt("rec-rule", rule_id="my-rule")]

    q = db.query.return_value.join.return_value.filter.return_value
    q.filter.return_value.order_by.return_value.limit.return_value.all.return_value = receipts

    resp = client.get("/receipts?rule_id=my-rule", headers={"X-API-Key": "test-key"})

    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 1
    assert data[0]["rule_id"] == "my-rule"


# ---------------------------------------------------------------------------
# GET /receipts/by-id/{receipt_id}
# ---------------------------------------------------------------------------


def test_get_receipt_by_id_returns_200(client_and_db):
    client, db = client_and_db
    receipt = _make_receipt("rec-pk")
    contract = _make_contract("act-001")

    # First query: Receipt by receipt_id; second query: ActionContract by action_id+tenant_id
    db.query.return_value.filter.return_value.first.side_effect = [receipt, contract]

    resp = client.get("/receipts/by-id/rec-pk", headers={"X-API-Key": "test-key"})

    assert resp.status_code == 200
    data = resp.json()
    assert data["receipt_id"] == "rec-pk"
    assert data["decision"] == "APPROVED"


def test_get_receipt_by_id_404_when_receipt_missing(client_and_db):
    client, db = client_and_db

    db.query.return_value.filter.return_value.first.return_value = None

    resp = client.get("/receipts/by-id/nonexistent", headers={"X-API-Key": "test-key"})

    assert resp.status_code == 404
    assert "not found" in resp.json()["detail"]


def test_get_receipt_by_id_404_when_tenant_mismatch(client_and_db):
    client, db = client_and_db
    receipt = _make_receipt("rec-other")
    # Contract not found for this tenant
    db.query.return_value.filter.return_value.first.side_effect = [receipt, None]

    resp = client.get("/receipts/by-id/rec-other", headers={"X-API-Key": "test-key"})

    assert resp.status_code == 404
