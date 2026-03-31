"""Unit tests for the /policy-rules CRUD router."""
from __future__ import annotations

from datetime import datetime, timezone
from unittest.mock import MagicMock, patch

import pytest
from fastapi.testclient import TestClient

from app.api.deps import get_auth_context, AuthContext
from app.db.session import get_db
from app.main import app


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

TENANT_ID = "tenant-keel"
FAKE_AUTH = AuthContext(tenant_id=TENANT_ID, role="admin")


def _make_rule(
    rule_id: str = "rule-1",
    tenant_id: str = TENANT_ID,
    action_type: str = "log_expense",
    decision: str = "APPROVED",
    priority: int = 0,
    active: bool = True,
) -> MagicMock:
    rule = MagicMock()
    rule.rule_id = rule_id
    rule.tenant_id = tenant_id
    rule.rule_version = "1"
    rule.action_type = action_type
    rule.conditions = {}
    rule.decision = decision
    rule.priority = priority
    rule.active = active
    rule.description = None
    rule.created_at = datetime(2026, 3, 25, tzinfo=timezone.utc)
    return rule


@pytest.fixture()
def client_and_db():
    """Return a TestClient with both get_db and get_auth_context overridden."""
    mock_db = MagicMock()
    app.dependency_overrides[get_db] = lambda: mock_db
    app.dependency_overrides[get_auth_context] = lambda: FAKE_AUTH
    with TestClient(app, raise_server_exceptions=True) as c:
        yield c, mock_db
    app.dependency_overrides.clear()


# ---------------------------------------------------------------------------
# POST /policy-rules
# ---------------------------------------------------------------------------


def test_create_rule_returns_201(client_and_db):
    client, db = client_and_db
    rule = _make_rule()

    db.query.return_value.filter.return_value.first.return_value = None
    db.refresh.side_effect = lambda obj: None

    with patch("app.api.routes.policy_rules.PolicyRule", return_value=rule):
        resp = client.post(
            "/policy-rules",
            json={
                "rule_id": "rule-1",
                "action_type": "log_expense",
                "conditions": {},
            },
            headers={"X-API-Key": "test-key"},
        )

    assert resp.status_code == 201
    data = resp.json()
    assert data["rule_id"] == "rule-1"
    assert data["action_type"] == "log_expense"
    assert data["decision"] == "APPROVED"


def test_create_rule_409_on_duplicate(client_and_db):
    client, db = client_and_db
    existing_rule = _make_rule()

    # Simulate existing rule found for the tenant
    db.query.return_value.filter.return_value.first.return_value = existing_rule

    resp = client.post(
        "/policy-rules",
        json={
            "rule_id": "rule-1",
            "action_type": "log_expense",
            "conditions": {},
        },
        headers={"X-API-Key": "test-key"},
    )

    assert resp.status_code == 409
    assert "already exists" in resp.json()["detail"]


# ---------------------------------------------------------------------------
# GET /policy-rules
# ---------------------------------------------------------------------------


def test_list_rules_returns_rules(client_and_db):
    client, db = client_and_db
    rules = [_make_rule("rule-1"), _make_rule("rule-2", action_type="propose_trade")]

    db.query.return_value.filter.return_value.order_by.return_value.all.return_value = rules

    resp = client.get("/policy-rules", headers={"X-API-Key": "test-key"})

    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 2
    assert data[0]["rule_id"] == "rule-1"
    assert data[1]["rule_id"] == "rule-2"


def test_list_rules_filters_by_action_type(client_and_db):
    client, db = client_and_db
    rules = [_make_rule("rule-2", action_type="propose_trade")]

    db.query.return_value.filter.return_value.filter.return_value.order_by.return_value.all.return_value = rules

    resp = client.get(
        "/policy-rules?action_type=propose_trade",
        headers={"X-API-Key": "test-key"},
    )

    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 1
    assert data[0]["action_type"] == "propose_trade"


# ---------------------------------------------------------------------------
# PUT /policy-rules/{rule_id}
# ---------------------------------------------------------------------------


def test_update_rule_returns_updated(client_and_db):
    client, db = client_and_db
    rule = _make_rule()

    db.query.return_value.filter.return_value.first.return_value = rule
    db.refresh.side_effect = lambda obj: None

    resp = client.put(
        "/policy-rules/rule-1",
        json={"active": False, "priority": 10},
        headers={"X-API-Key": "test-key"},
    )

    assert resp.status_code == 200
    # setattr was called on the mock — verify via the response
    assert resp.json()["rule_id"] == "rule-1"


def test_update_rule_404_when_not_found(client_and_db):
    client, db = client_and_db

    db.query.return_value.filter.return_value.first.return_value = None

    resp = client.put(
        "/policy-rules/nonexistent",
        json={"active": False},
        headers={"X-API-Key": "test-key"},
    )

    assert resp.status_code == 404


# ---------------------------------------------------------------------------
# DELETE /policy-rules/{rule_id}
# ---------------------------------------------------------------------------


def test_delete_rule_returns_204(client_and_db):
    client, db = client_and_db
    rule = _make_rule()

    db.query.return_value.filter.return_value.first.return_value = rule

    resp = client.delete("/policy-rules/rule-1", headers={"X-API-Key": "test-key"})

    assert resp.status_code == 204
    db.delete.assert_called_once_with(rule)
    db.commit.assert_called()


def test_delete_rule_404_when_not_found(client_and_db):
    client, db = client_and_db

    db.query.return_value.filter.return_value.first.return_value = None

    resp = client.delete("/policy-rules/nonexistent", headers={"X-API-Key": "test-key"})

    assert resp.status_code == 404
