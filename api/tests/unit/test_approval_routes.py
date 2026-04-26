"""Lane 1 — public approval surface (`/a/{id}` + `/r/{tenant}/{receipt}`).

Covers T2 in the eng-review test plan: the 6-shape contract is exercised end
to end against the real FastAPI router, with the database mocked at the
per-class boundary so each test asserts a specific shape transition.

We don't sit on a real Postgres in unit tests — the JSONB columns are mocked
through SQLAlchemy's MagicMock surface. Integration tests cover round-trip
schema behavior; this module is about route discrimination logic.
"""
from __future__ import annotations

import time
from datetime import datetime, timedelta, timezone
from typing import Any
from unittest.mock import MagicMock

import pytest
from fastapi.testclient import TestClient

from app.api.deps import AuthContext, get_auth_context
from app.api.routes.approval import _csrf_token_for
from app.crypto.hmac_tokens import generate_signing_key, sign
from app.db.session import get_db
from app.main import app
from app.models.action_contract import ActionContract
from app.models.receipt import Receipt
from app.models.tenant_signing_key import TenantSigningKey
from app.schemas.actions import ActionStatus
from app.schemas.approval import ApprovalShape


TENANT_ID = "tnt-lane-1"
ACTION_ID = "act-abc"
FAKE_AUTH = AuthContext(tenant_id=TENANT_ID, role="admin")


def _make_contract(
    *,
    status: str = ActionStatus.PROPOSED,
    decided_at: datetime | None = None,
    proposed_by: str = "billing-bot",
    snapshot: dict[str, Any] | None = None,
) -> MagicMock:
    """Return a MagicMock that quacks like an ActionContract row."""
    c = MagicMock(spec=ActionContract)
    c.action_id = ACTION_ID
    c.tenant_id = TENANT_ID
    c.proposed_by = proposed_by
    c.action_type = "apply_discount"
    c.target_system = "stripe"
    c.target_entity = {"customer_id": "cus_42"}
    c.parameters = {"amount": 1500, "reason": "retention"}
    c.context = {}
    c.status = status
    c.mode = "live"
    c.agent_class = "capability:retention"
    c.org_unit = "cs/retention"
    c.trust_source = "api_key"
    c.canonical_args_hash = "hash-1"
    c.decided_at = decided_at
    c.agent_identity_snapshot = snapshot
    c.created_at = datetime.now(timezone.utc) - timedelta(minutes=2)
    c.updated_at = c.created_at
    return c


def _make_signing_key_row(*, rotated_at: datetime | None = None) -> tuple[MagicMock, str]:
    key = generate_signing_key()
    row = MagicMock(spec=TenantSigningKey)
    row.tenant_id = TENANT_ID
    row.signing_key = key
    row.rotated_at = rotated_at or (datetime.now(timezone.utc) - timedelta(days=1))
    row.created_at = row.rotated_at
    return row, key


class _DbStub:
    """Per-class query router for unit tests.

    Production code does `db.query(SomeClass).filter(...).first()`. We capture
    the class arg to dispatch to a mock pre-loaded with the row that test
    intends to surface.
    """

    def __init__(self) -> None:
        self.tables: dict[type, list[Any]] = {}
        self.add_calls: list[Any] = []
        self.commit_calls = 0
        self.execute_results: list[Any] = []
        self._exec_index = 0

    def set_first(self, cls: type, row: Any) -> None:
        self.tables[cls] = [row]

    def query(self, cls):  # pragma: no cover - exercised via TestClient
        m = MagicMock()
        rows = self.tables.get(cls, [])
        m.filter.return_value.first.return_value = rows[0] if rows else None
        m.filter.return_value.filter.return_value.first.return_value = (
            rows[0] if rows else None
        )
        return m

    def add(self, obj: Any) -> None:
        self.add_calls.append(obj)

    def commit(self) -> None:
        self.commit_calls += 1

    def rollback(self) -> None:
        pass

    def refresh(self, obj: Any) -> None:
        pass

    def flush(self) -> None:
        pass

    def execute(self, stmt: Any):
        if self._exec_index >= len(self.execute_results):
            res = MagicMock()
            res.first.return_value = (ACTION_ID,)
            return res
        out = self.execute_results[self._exec_index]
        self._exec_index += 1
        return out


@pytest.fixture()
def stub() -> _DbStub:
    s = _DbStub()
    app.dependency_overrides[get_db] = lambda: s
    app.dependency_overrides[get_auth_context] = lambda: FAKE_AUTH
    yield s
    app.dependency_overrides.clear()


@pytest.fixture()
def client(stub: _DbStub) -> TestClient:
    return TestClient(app, raise_server_exceptions=True)


# ---------------------------------------------------------------------------
# Helper round-trip — keeps the CSRF derivation deterministic across deploys
# ---------------------------------------------------------------------------


def test_csrf_token_is_deterministic_per_sig() -> None:
    a = _csrf_token_for("v1.aaa.bbb")
    b = _csrf_token_for("v1.aaa.bbb")
    c = _csrf_token_for("v1.aaa.ccc")
    assert a == b
    assert a != c


# ---------------------------------------------------------------------------
# GET /a/{action_id} — render-only surface (OV5 / F1)
# ---------------------------------------------------------------------------


def test_get_returns_invalid_sig_when_action_unknown(stub: _DbStub, client: TestClient) -> None:
    """No contract row → INVALID_SIG_ERROR (no leak per D20)."""
    resp = client.get(f"/a/{ACTION_ID}?sig=v1.aaa.bbb")
    assert resp.status_code == 200
    body = resp.json()
    assert body["shape"] == ApprovalShape.INVALID_SIG_ERROR.value
    assert "action_id" not in body


def test_get_returns_invalid_sig_when_signature_bad(stub: _DbStub, client: TestClient) -> None:
    contract = _make_contract()
    stub.set_first(ActionContract, contract)
    key_row, _ = _make_signing_key_row()
    stub.set_first(TenantSigningKey, key_row)

    resp = client.get(f"/a/{ACTION_ID}?sig=v1.bogus.bogus")
    assert resp.status_code == 200
    assert resp.json()["shape"] == ApprovalShape.INVALID_SIG_ERROR.value


def test_get_returns_pending_on_valid_token(stub: _DbStub, client: TestClient) -> None:
    """Happy path: token verifies, contract is decidable → PENDING shape."""
    snapshot = {
        "handle": "billing-bot",
        "version": "v3.2.1",
        "spawned_by": "deploys/v0.4.0",
        "actions_today": 14,
        "denied_today": 0,
        "agent_class": "capability:retention",
        "org_unit": "cs/retention",
        "trust_source": "api_key",
    }
    contract = _make_contract(snapshot=snapshot)
    stub.set_first(ActionContract, contract)
    key_row, key = _make_signing_key_row()
    stub.set_first(TenantSigningKey, key_row)

    token = sign(action_id=ACTION_ID, tenant_id=TENANT_ID, signing_key=key)
    resp = client.get(f"/a/{ACTION_ID}?sig={token}")
    assert resp.status_code == 200
    body = resp.json()
    assert body["shape"] == ApprovalShape.PENDING.value
    assert body["action"]["action_id"] == ACTION_ID
    assert body["action"]["agent"]["handle"] == "billing-bot"
    assert body["action"]["agent"]["actions_today"] == 14


def test_get_returns_already_decided_when_status_terminal(stub: _DbStub, client: TestClient) -> None:
    """Token still valid, but contract is APPROVED — surface ALREADY_DECIDED_RACE."""
    decided = datetime.now(timezone.utc)
    contract = _make_contract(status=ActionStatus.APPROVED, decided_at=decided)
    stub.set_first(ActionContract, contract)
    key_row, key = _make_signing_key_row()
    stub.set_first(TenantSigningKey, key_row)

    token = sign(action_id=ACTION_ID, tenant_id=TENANT_ID, signing_key=key)
    resp = client.get(f"/a/{ACTION_ID}?sig={token}")
    body = resp.json()
    assert body["shape"] == ApprovalShape.ALREADY_DECIDED_RACE.value
    assert body["decision"] == "APPROVED"
    assert body["receipt_url"].startswith(f"/r/{TENANT_ID}/")


def test_get_returns_expired_when_token_past_exp(stub: _DbStub, client: TestClient) -> None:
    contract = _make_contract()
    stub.set_first(ActionContract, contract)
    key_row, key = _make_signing_key_row()
    stub.set_first(TenantSigningKey, key_row)

    past = int(time.time()) - 7200
    token = sign(
        action_id=ACTION_ID,
        tenant_id=TENANT_ID,
        signing_key=key,
        ttl_seconds=60,
        now=past,
    )
    resp = client.get(f"/a/{ACTION_ID}?sig={token}")
    body = resp.json()
    assert body["shape"] == ApprovalShape.EXPIRED_ERROR.value
    # EXPIRED is benign — D20 says action_id leak is OK on expiry.
    assert body["action_id"] == ACTION_ID


def test_get_returns_rotated_when_token_predates_rotation(stub: _DbStub, client: TestClient) -> None:
    """D2 — rotation = revocation."""
    rotated_at = datetime.now(timezone.utc)
    key_row, key = _make_signing_key_row(rotated_at=rotated_at)
    contract = _make_contract()
    stub.set_first(ActionContract, contract)
    stub.set_first(TenantSigningKey, key_row)

    # Sign well before rotation moment.
    pre_rotation = int(rotated_at.timestamp()) - 3600
    token = sign(
        action_id=ACTION_ID,
        tenant_id=TENANT_ID,
        signing_key=key,
        ttl_seconds=86400,
        now=pre_rotation,
    )
    resp = client.get(f"/a/{ACTION_ID}?sig={token}")
    body = resp.json()
    assert body["shape"] == ApprovalShape.ROTATED_ERROR.value
    assert body["tenant_id"] == TENANT_ID


# ---------------------------------------------------------------------------
# POST /a/{action_id}/decision — token + CSRF, single-use via DB CAS
# ---------------------------------------------------------------------------


def test_post_csrf_mismatch_returns_invalid_sig(stub: _DbStub, client: TestClient) -> None:
    contract = _make_contract()
    stub.set_first(ActionContract, contract)
    key_row, key = _make_signing_key_row()
    stub.set_first(TenantSigningKey, key_row)

    token = sign(action_id=ACTION_ID, tenant_id=TENANT_ID, signing_key=key)
    resp = client.post(
        f"/a/{ACTION_ID}/decision?sig={token}",
        json={"decision": "APPROVED", "csrf_token": "bogus"},
    )
    assert resp.status_code == 200
    assert resp.json()["shape"] == ApprovalShape.INVALID_SIG_ERROR.value


def test_post_happy_path_returns_decision_receipt(stub: _DbStub, client: TestClient) -> None:
    """End-to-end: valid token + correct CSRF → DECISION_RECEIPT card."""
    contract = _make_contract()
    stub.set_first(ActionContract, contract)
    key_row, key = _make_signing_key_row()
    stub.set_first(TenantSigningKey, key_row)
    receipt = MagicMock(spec=Receipt)
    receipt.receipt_id = "rcpt_42"
    receipt.signature_alg = "ed25519-v1"
    receipt.public_key_id = "stat-ed25519-dev"
    stub.set_first(Receipt, receipt)

    token = sign(action_id=ACTION_ID, tenant_id=TENANT_ID, signing_key=key)
    csrf = _csrf_token_for(token)
    # approve_action() flips status + decided_at on the contract via SQL UPDATE
    # — simulate the side-effect on the mock used by db.refresh.
    def _commit_side_effect():
        contract.status = ActionStatus.APPROVED
        contract.decided_at = datetime.now(timezone.utc)
    stub.commit = _commit_side_effect  # type: ignore[assignment]

    resp = client.post(
        f"/a/{ACTION_ID}/decision?sig={token}",
        json={
            "decision": "APPROVED",
            "csrf_token": csrf,
            "decided_by": "alice@example.com",
        },
    )
    body = resp.json()
    assert body["shape"] == ApprovalShape.DECISION_RECEIPT.value
    assert body["decision"] == "APPROVED"
    assert body["decided_by"] == "alice@example.com"
    assert body["receipt_id"] == "rcpt_42"
    assert body["receipt_url"] == f"/r/{TENANT_ID}/rcpt_42"
    assert body["signature_alg"] == "ed25519-v1"


def test_post_already_decided_routes_to_race_shape(stub: _DbStub, client: TestClient) -> None:
    """Operator clicked first — token POST sees DecisionConflict → ALREADY_DECIDED_RACE."""
    decided = datetime.now(timezone.utc)
    contract = _make_contract(status=ActionStatus.APPROVED, decided_at=decided)
    stub.set_first(ActionContract, contract)
    key_row, key = _make_signing_key_row()
    stub.set_first(TenantSigningKey, key_row)

    token = sign(action_id=ACTION_ID, tenant_id=TENANT_ID, signing_key=key)
    csrf = _csrf_token_for(token)
    resp = client.post(
        f"/a/{ACTION_ID}/decision?sig={token}",
        json={"decision": "DENIED", "csrf_token": csrf},
    )
    body = resp.json()
    assert body["shape"] == ApprovalShape.ALREADY_DECIDED_RACE.value
    # The winning decision is APPROVED (the simulated operator); the token
    # POST tried DENIED but loses the race.
    assert body["decision"] == "APPROVED"


# ---------------------------------------------------------------------------
# GET /r/{tenant_id}/{receipt_id} — public receipts page
# ---------------------------------------------------------------------------


def test_public_receipt_returns_payload(stub: _DbStub, client: TestClient) -> None:
    receipt = MagicMock(spec=Receipt)
    receipt.receipt_id = "rcpt_1"
    receipt.action_id = ACTION_ID
    receipt.decision = "APPROVED"
    receipt.executed_at = None
    receipt.execution_result = None
    receipt.hash = "deadbeef"
    receipt.signature = "sig"
    receipt.signature_alg = "ed25519-v1"
    receipt.public_key_id = "stat-ed25519-dev"
    receipt.created_at = datetime.now(timezone.utc)
    stub.set_first(Receipt, receipt)
    contract = _make_contract(status=ActionStatus.APPROVED, decided_at=receipt.created_at)
    stub.set_first(ActionContract, contract)

    resp = client.get(f"/r/{TENANT_ID}/{receipt.receipt_id}")
    assert resp.status_code == 200
    body = resp.json()
    assert body["receipt_id"] == "rcpt_1"
    assert body["tenant_id"] == TENANT_ID
    assert body["decision"] == "APPROVED"
    assert body["signature_alg"] == "ed25519-v1"


def test_public_receipt_404_on_tenant_mismatch(stub: _DbStub, client: TestClient) -> None:
    """Probing one tenant's path with another tenant's receipt id must 404 — never redirect."""
    receipt = MagicMock(spec=Receipt)
    receipt.receipt_id = "rcpt_1"
    receipt.action_id = ACTION_ID
    receipt.decision = "APPROVED"
    receipt.executed_at = None
    receipt.execution_result = None
    receipt.hash = "deadbeef"
    receipt.signature = None
    receipt.signature_alg = None
    receipt.public_key_id = None
    receipt.created_at = datetime.now(timezone.utc)
    stub.set_first(Receipt, receipt)
    contract = _make_contract()  # belongs to TENANT_ID
    stub.set_first(ActionContract, contract)

    resp = client.get(f"/r/some-other-tenant/{receipt.receipt_id}")
    assert resp.status_code == 404


def test_public_receipt_404_when_missing(stub: _DbStub, client: TestClient) -> None:
    resp = client.get(f"/r/{TENANT_ID}/nope")
    assert resp.status_code == 404
