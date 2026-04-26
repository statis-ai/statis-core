"""Lane 1 — actions.py extensions.

Two surfaces:

  * `GET /actions/{id}/similar` — A2 graduation lookup.
  * `POST /actions/{id}/approve` — Q1 convergence: must route through
    `services.approval.approve_action()` so the operator path and the public
    token path cannot drift.
"""
from __future__ import annotations

from datetime import datetime, timezone
from unittest.mock import MagicMock, patch

import pytest
from fastapi.testclient import TestClient

from app.api.deps import AuthContext, get_auth_context
from app.db.session import get_db
from app.main import app
from app.models.action_contract import ActionContract
from app.schemas.actions import ActionStatus


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


def _make_contract(
    action_id: str = "act-x",
    status: str = ActionStatus.ESCALATED,
    args_hash: str | None = "h1",
) -> MagicMock:
    c = MagicMock(spec=ActionContract)
    c.action_id = action_id
    c.tenant_id = TENANT_ID
    c.proposed_by = "billing-bot"
    c.action_type = "apply_discount"
    c.status = status
    c.canonical_args_hash = args_hash
    c.decided_at = None
    c.created_at = datetime.now(timezone.utc)
    c.updated_at = c.created_at
    c.target_entity = {}
    c.target_system = "stripe"
    c.parameters = {}
    c.context = {}
    c.mode = "live"
    c.agent_class = None
    c.org_unit = None
    c.trust_source = "api_key"
    c.deferred_until = None
    c.defer_count = 0
    return c


# ---------------------------------------------------------------------------
# GET /actions/{id}/similar
# ---------------------------------------------------------------------------


def test_similar_returns_empty_when_args_hash_missing(client_and_db) -> None:
    """Legacy row predating migration 0040 — nothing to compare."""
    client, db = client_and_db
    contract = _make_contract(args_hash=None)
    db.query.return_value.filter.return_value.first.return_value = contract

    resp = client.get("/actions/act-x/similar", headers={"X-API-Key": "test"})
    assert resp.status_code == 200
    assert resp.json() == []


def test_similar_404_on_unknown(client_and_db) -> None:
    client, db = client_and_db
    db.query.return_value.filter.return_value.first.return_value = None
    resp = client.get("/actions/nope/similar", headers={"X-API-Key": "test"})
    assert resp.status_code == 404


def test_similar_returns_recent_siblings(client_and_db) -> None:
    """Happy path — three prior identical decisions order desc by decided_at."""
    client, db = client_and_db
    target = _make_contract()
    decided1 = datetime.now(timezone.utc)
    sib1 = _make_contract(action_id="act-1", status=ActionStatus.APPROVED)
    sib1.decided_at = decided1
    sib2 = _make_contract(action_id="act-2", status=ActionStatus.APPROVED)
    sib2.decided_at = decided1

    target_q = MagicMock()
    target_q.filter.return_value.first.return_value = target
    sib_q = MagicMock()
    sib_q.outerjoin.return_value.filter.return_value.order_by.return_value.limit.return_value.all.return_value = [
        (sib1, None),
        (sib2, None),
    ]

    def _route_query(*classes):
        # First call: db.query(ActionContract) — target lookup.
        # Second call: db.query(ActionContract, EscalationReview) — siblings.
        if len(classes) == 1:
            return target_q
        return sib_q

    db.query.side_effect = _route_query

    resp = client.get(
        "/actions/act-x/similar?window=48h&limit=3",
        headers={"X-API-Key": "test"},
    )
    assert resp.status_code == 200
    body = resp.json()
    assert len(body) == 2
    assert body[0]["action_id"] == "act-1"
    assert body[0]["decision"] == "APPROVED"


def test_similar_rejects_invalid_window(client_and_db) -> None:
    client, db = client_and_db
    target = _make_contract()
    db.query.return_value.filter.return_value.first.return_value = target
    resp = client.get(
        "/actions/act-x/similar?window=zzz",
        headers={"X-API-Key": "test"},
    )
    assert resp.status_code == 400


# ---------------------------------------------------------------------------
# POST /actions/{id}/approve — Q1 convergence with services.approval
# ---------------------------------------------------------------------------


def test_approve_route_delegates_to_shared_service(client_and_db) -> None:
    """Q1 — operator approve must route through approve_action()."""
    client, _db = client_and_db
    refreshed = _make_contract(status=ActionStatus.APPROVED)
    refreshed.decided_at = datetime.now(timezone.utc)

    with patch("app.api.routes.actions.approve_action", return_value=refreshed) as call:
        resp = client.post(
            "/actions/act-x/approve",
            json={"reviewer_id": "alice@example.com"},
            headers={"X-API-Key": "test"},
        )

    assert resp.status_code == 200
    assert call.call_count == 1
    inp = call.call_args.args[1]
    assert inp.action_id == "act-x"
    assert inp.tenant_id == TENANT_ID
    assert inp.decision == "APPROVED"
    assert inp.decided_by == "alice@example.com"
    assert inp.token is None  # operator path — never carries a token


def test_approve_route_translates_decision_race_to_410(client_and_db) -> None:
    """If the public token won the race, the operator path must surface 410 — not 500."""
    from app.services.approval import DecisionRace

    client, _db = client_and_db
    with patch(
        "app.api.routes.actions.approve_action",
        side_effect=DecisionRace("act-x"),
    ):
        resp = client.post(
            "/actions/act-x/approve",
            json={"reviewer_id": "alice@example.com"},
            headers={"X-API-Key": "test"},
        )
    assert resp.status_code == 410
