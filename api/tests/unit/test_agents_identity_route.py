"""Lane 1 — `GET /agents/{id}/identity` for the operator console.

The token-gated public approval page reads the FROZEN snapshot off the
contract; this endpoint is for in-app callers that want today's counters
recomputed live. Tests that the registered-agent path returns the
AgentIdentitySnapshot shape.
"""
from __future__ import annotations

from datetime import datetime, timezone
from unittest.mock import MagicMock

import pytest
from fastapi.testclient import TestClient

from app.api.deps import AuthContext, get_auth_context
from app.db.session import get_db
from app.main import app
from app.models.action_contract import ActionContract
from app.models.agent import Agent


TENANT_ID = "tnt-lane-1"
FAKE_AUTH = AuthContext(tenant_id=TENANT_ID, role="admin", trust_source="api_key")


@pytest.fixture()
def client_and_db():
    db = MagicMock()
    app.dependency_overrides[get_db] = lambda: db
    app.dependency_overrides[get_auth_context] = lambda: FAKE_AUTH
    with TestClient(app, raise_server_exceptions=True) as c:
        yield c, db
    app.dependency_overrides.clear()


def _make_agent() -> MagicMock:
    a = MagicMock(spec=Agent)
    a.agent_id = "billing-bot"
    a.tenant_id = TENANT_ID
    a.name = "Billing Bot"
    a.allowed_action_types = []
    a.rate_limit_per_hour = None
    a.agent_class = "capability:retention"
    a.org_unit = "cs/retention"
    a.is_active = True
    a.created_at = datetime.now(timezone.utc)
    return a


def test_identity_route_404_on_unknown(client_and_db) -> None:
    client, db = client_and_db
    db.query.return_value.filter.return_value.first.return_value = None

    resp = client.get("/agents/nope/identity", headers={"X-API-Key": "test"})
    assert resp.status_code == 404


def test_identity_route_returns_snapshot(client_and_db) -> None:
    """Happy path — agent exists, query returns counts, response matches schema."""
    client, db = client_and_db
    agent = _make_agent()

    # First call: agent lookup returns the agent. Subsequent .count() calls
    # are answered separately.
    agent_query = MagicMock()
    agent_query.filter.return_value.first.return_value = agent

    actions_today_query = MagicMock()
    actions_today_query.filter.return_value.count.return_value = 14

    denied_today_query = MagicMock()
    denied_today_query.filter.return_value.count.return_value = 0

    def _route_query(cls):
        if cls is Agent:
            return agent_query
        if cls is ActionContract:
            # The route issues two .count() queries — return the first one
            # then the second by exhausting an iterator.
            if not hasattr(_route_query, "_n"):
                _route_query._n = 0
            _route_query._n += 1
            return actions_today_query if _route_query._n == 1 else denied_today_query
        return MagicMock()

    db.query.side_effect = _route_query

    resp = client.get("/agents/billing-bot/identity", headers={"X-API-Key": "test"})
    assert resp.status_code == 200
    body = resp.json()
    assert body["handle"] == "billing-bot"
    assert body["actions_today"] == 14
    assert body["denied_today"] == 0
    assert body["agent_class"] == "capability:retention"
    assert body["org_unit"] == "cs/retention"
    assert body["trust_source"] == "api_key"
