"""Auto-graduation: 3-approval shape → drafted policy rule.

When an operator (or token-path approver) approves an action, this service
checks whether the same canonical-args shape has now been approved three
times within a 48-hour window. If so, it INSERTs a `policy_rules` row with
`source='graduated'` so the next call with the same shape lands as APPROVED
without paging anyone.

Hooked into `services.approval.approve_action()` via the `on_decision`
callback (see routes/actions.py and routes/approval.py). Inline-sync today
per the post-OV4 Week 1 envelope; once telemetry shows graduation latency
matters under load, lift this onto the worker as a queued job.

    # TODO(post-Week-1): move maybe_graduate() onto the worker as a queued
    # background job. The current inline-sync model adds the graduation
    # lookup + rule INSERT to the operator's approve POST latency. Fine
    # at design-partner volumes; not fine at scale. The contract is a
    # single hash + tenant + action_type, so the queue payload is tiny.

Idempotency
-----------
Two writers can race after a 3rd-and-4th approval. Both call maybe_graduate;
both see count >= 3; both try to INSERT. The
(tenant_id, action_type, canonical_args_hash) lookup catches the race —
the second writer sees the rule that the first one wrote and skips. We
serialize on the unique-by-shape constraint at the application level
because we don't want to require a UNIQUE index that would block manual
rules from co-existing with graduated ones for the same hash (manual
override is a future feature).
"""
from __future__ import annotations

import logging
import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional

from sqlalchemy.orm import Session

from app.models.action_contract import ActionContract
from app.models.policy_rule import PolicyRule
from app.schemas.actions import ActionStatus


_log = logging.getLogger("statis.graduation")

# 48h matches the existing /actions/{id}/similar default window (lane-1).
DEFAULT_WINDOW_HOURS = 48
# Threshold: an approval count of GRADUATION_THRESHOLD or more triggers a
# rule draft. The triggering action is itself counted.
GRADUATION_THRESHOLD = 3
# Priority: graduated rules outrank seeded manual rules so the auto-approve
# fast-path actually fires. Manual seeds use priority 0; bump to 100 here so
# operators can still override by writing a higher-priority manual rule.
GRADUATED_RULE_PRIORITY = 100


def maybe_graduate(
    db: Session,
    action: ActionContract,
    *,
    window_hours: int = DEFAULT_WINDOW_HOURS,
) -> Optional[PolicyRule]:
    """If `action` is the 3rd+ approval of its shape in `window_hours`, draft a rule.

    Returns the inserted PolicyRule (or the existing graduated rule, on race)
    when graduation fires, else None.

    Pre-conditions: `action` must already be APPROVED and committed. Side
    effects: may INSERT a row in `policy_rules`. Commits the rule write.
    """
    if action.status != ActionStatus.APPROVED:
        return None
    if not action.canonical_args_hash:
        # Legacy row predating canonical_args_hash, or non-graduatable shape.
        return None

    # Idempotency check first — cheap index hit, avoids re-counting work.
    existing = (
        db.query(PolicyRule)
        .filter(
            PolicyRule.tenant_id == action.tenant_id,
            PolicyRule.action_type == action.action_type,
            PolicyRule.canonical_args_hash == action.canonical_args_hash,
            PolicyRule.source == "graduated",
        )
        .first()
    )
    if existing is not None:
        return existing

    since = datetime.now(timezone.utc) - timedelta(hours=window_hours)
    approved_count = (
        db.query(ActionContract)
        .filter(
            ActionContract.tenant_id == action.tenant_id,
            ActionContract.action_type == action.action_type,
            ActionContract.canonical_args_hash == action.canonical_args_hash,
            ActionContract.status == ActionStatus.APPROVED,
            ActionContract.decided_at.isnot(None),
            ActionContract.decided_at >= since,
        )
        .count()
    )
    if approved_count < GRADUATION_THRESHOLD:
        return None

    rule = PolicyRule(
        rule_id=f"graduated_{action.action_type}_{action.canonical_args_hash[:12]}_v1",
        tenant_id=action.tenant_id,
        rule_version="1",
        action_type=action.action_type,
        conditions={"canonical_args_hash": action.canonical_args_hash},
        decision="APPROVED",
        priority=GRADUATED_RULE_PRIORITY,
        active=True,
        description=(
            f"Auto-graduated after {approved_count} approvals in {window_hours}h. "
            f"Triggered by {action.action_id}."
        ),
        canonical_args_hash=action.canonical_args_hash,
        source="graduated",
        graduated_from_action_id=action.action_id,
    )
    try:
        db.add(rule)
        db.commit()
        db.refresh(rule)
        _log.info(
            "graduation: auto-drafted rule %s for tenant=%s action_type=%s hash=%s",
            rule.rule_id,
            action.tenant_id,
            action.action_type,
            action.canonical_args_hash[:12],
        )
        return rule
    except Exception:
        # Race: another writer beat us to the INSERT. Re-query and return.
        db.rollback()
        racing = (
            db.query(PolicyRule)
            .filter(
                PolicyRule.tenant_id == action.tenant_id,
                PolicyRule.action_type == action.action_type,
                PolicyRule.canonical_args_hash == action.canonical_args_hash,
                PolicyRule.source == "graduated",
            )
            .first()
        )
        return racing


def _stable_rule_id(action: ActionContract) -> str:
    """Deterministic rule_id from (tenant, action_type, hash). Exposed for tests."""
    return f"graduated_{action.action_type}_{action.canonical_args_hash[:12]}_v1"
