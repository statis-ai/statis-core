"""Integration tests for `services.graduation.maybe_graduate`.

Real Postgres via testcontainers — graduation is a multi-row count + INSERT
that's brittle to mock. Each test composes a population of approved /
denied / outside-window contracts against a single tenant + action_type +
canonical_args_hash and asserts whether `maybe_graduate` drafts a rule.

Plan reference: D22 graduation auto-draft.
"""
from __future__ import annotations

import uuid
from datetime import datetime, timedelta, timezone

import pytest
from sqlalchemy.orm import Session

from app.models.action_contract import ActionContract
from app.models.policy_rule import PolicyRule
from app.schemas.actions import ActionStatus
from app.services.graduation import (
    GRADUATION_THRESHOLD,
    DEFAULT_WINDOW_HOURS,
    maybe_graduate,
)


TENANT = "tnt-graduation-test"
ACTION_TYPE = "warehouse.execute_sql"
HASH_A = "a" * 64
HASH_B = "b" * 64


def _approved(
    db: Session,
    *,
    args_hash: str = HASH_A,
    action_type: str = ACTION_TYPE,
    decided_at: datetime | None = None,
    status: str = ActionStatus.APPROVED,
    tenant_id: str = TENANT,
) -> ActionContract:
    decided_at = decided_at or datetime.now(timezone.utc)
    contract = ActionContract(
        action_id=f"act-{uuid.uuid4().hex[:12]}",
        tenant_id=tenant_id,
        proposed_by="agent-bot",
        action_type=action_type,
        target_entity={},
        target_system="warehouse",
        parameters={"query": "SELECT 1"},
        context={},
        status=status,
        canonical_args_hash=args_hash,
        decided_at=decided_at,
    )
    db.add(contract)
    db.flush()
    return contract


@pytest.fixture(autouse=True)
def _truncate(db_session: Session):
    """Reset action_contracts + policy_rules per test for clean counts."""
    db_session.execute(
        # `RESTART IDENTITY CASCADE` would be ideal but receipts FK back; just
        # delete the rows we own here.
        __import__("sqlalchemy").text(
            "DELETE FROM policy_rules WHERE tenant_id = :t"
        ),
        {"t": TENANT},
    )
    db_session.execute(
        __import__("sqlalchemy").text(
            "DELETE FROM action_contracts WHERE tenant_id = :t"
        ),
        {"t": TENANT},
    )
    db_session.commit()
    yield


def test_below_threshold_drafts_no_rule(db_session: Session) -> None:
    """2 prior approvals + 1 trigger = exactly 3 total; threshold IS 3 so this
    actually fires. Use 1 prior + trigger to test below-threshold."""
    _approved(db_session)
    trigger = _approved(db_session)
    db_session.commit()

    rule = maybe_graduate(db_session, trigger)

    assert rule is None
    assert db_session.query(PolicyRule).filter(
        PolicyRule.tenant_id == TENANT,
        PolicyRule.source == "graduated",
    ).count() == 0


def test_third_approval_drafts_rule(db_session: Session) -> None:
    _approved(db_session)
    _approved(db_session)
    trigger = _approved(db_session)
    db_session.commit()

    rule = maybe_graduate(db_session, trigger)

    assert rule is not None
    assert rule.source == "graduated"
    assert rule.action_type == ACTION_TYPE
    assert rule.canonical_args_hash == HASH_A
    assert rule.decision == "APPROVED"
    assert rule.priority == 100
    assert rule.graduated_from_action_id == trigger.action_id
    assert rule.tenant_id == TENANT
    # Conditions must include canonical_args_hash so the evaluator's literal
    # match condition (test_policy_evaluator.TestCanonicalArgsHashCondition)
    # actually fires.
    assert rule.conditions == {"canonical_args_hash": HASH_A}


def test_idempotent_re_graduation(db_session: Session) -> None:
    """Calling maybe_graduate twice doesn't double-insert."""
    _approved(db_session)
    _approved(db_session)
    trigger = _approved(db_session)
    db_session.commit()

    first = maybe_graduate(db_session, trigger)
    second = maybe_graduate(db_session, trigger)

    assert first is not None and second is not None
    assert first.rule_id == second.rule_id
    assert db_session.query(PolicyRule).filter(
        PolicyRule.tenant_id == TENANT,
        PolicyRule.source == "graduated",
    ).count() == 1


def test_denials_do_not_count(db_session: Session) -> None:
    """3 denials + 1 approval = 1 approval total; below threshold."""
    _approved(db_session, status=ActionStatus.DENIED)
    _approved(db_session, status=ActionStatus.DENIED)
    _approved(db_session, status=ActionStatus.DENIED)
    trigger = _approved(db_session)
    db_session.commit()

    rule = maybe_graduate(db_session, trigger)

    assert rule is None


def test_outside_window_does_not_count(db_session: Session) -> None:
    old = datetime.now(timezone.utc) - timedelta(hours=DEFAULT_WINDOW_HOURS + 1)
    _approved(db_session, decided_at=old)
    _approved(db_session, decided_at=old)
    trigger = _approved(db_session)
    db_session.commit()

    rule = maybe_graduate(db_session, trigger)

    assert rule is None


def test_different_hash_does_not_count(db_session: Session) -> None:
    """Approvals of a different shape must not count toward this graduation."""
    _approved(db_session, args_hash=HASH_B)
    _approved(db_session, args_hash=HASH_B)
    trigger = _approved(db_session)
    db_session.commit()

    rule = maybe_graduate(db_session, trigger)

    assert rule is None


def test_different_tenant_does_not_count(db_session: Session) -> None:
    _approved(db_session, tenant_id="tnt-other")
    _approved(db_session, tenant_id="tnt-other")
    trigger = _approved(db_session)
    db_session.commit()

    rule = maybe_graduate(db_session, trigger)

    assert rule is None


def test_skips_when_action_has_no_hash(db_session: Session) -> None:
    legacy = _approved(db_session, args_hash=None)
    db_session.commit()

    rule = maybe_graduate(db_session, legacy)

    assert rule is None


def test_only_runs_for_approved_status(db_session: Session) -> None:
    pending = _approved(db_session, status=ActionStatus.PROPOSED)
    db_session.commit()

    rule = maybe_graduate(db_session, pending)

    assert rule is None


def test_threshold_constant_matches_assertion(db_session: Session) -> None:
    """Guard rail: if someone tweaks GRADUATION_THRESHOLD without updating
    the test that exercises the boundary, this asserts the boundary."""
    assert GRADUATION_THRESHOLD == 3
