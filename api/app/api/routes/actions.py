import types
import uuid
from datetime import datetime, timedelta, timezone
from typing import Any

import httpx
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.api.deps import AuthContext, get_auth_context
from app.db.session import get_db
from app.models.action_contract import ActionContract
from app.models.entity_state import EntityState
from app.models.kill_switch import KillSwitch
from app.models.escalation_review import EscalationReview
from app.models.policy_rule import PolicyRule
from app.models.receipt import Receipt
from app.models.threat_log import ThreatLog
from app.models.agent import Agent
from app.models.webhook import Webhook
from app.notifications.slack import SlackNotifier
from app.policy.evaluator import PolicyEvaluator, RuleSpec
from app.schemas.actions import ActionAccepted, ActionCompleteIn, ActionIn, ActionOut, ActionStatus
from app.schemas.escalation import EscalatedActionOut, EscalationReviewIn, EscalationReviewOut
from app.schemas.policy import EvaluateResponse
from app.models.context_log import ContextLogEntry
from app.schemas.context_log import ContextLogEntryOut, ContextLogVerifyOut
from app.security.context_log import verify_chain, write_context_log
from app.security.pii_masker import PIIMasker
from app.security.threat_detector import ThreatDetector
from app.utils.hashing import canonical_state_hash
from app.crypto import (
    SIGNATURE_ALG,
    KeyNotConfiguredError,
    canonical_signing_payload,
    get_active_key_id,
    sign_receipt_payload,
)

import logging

_signing_log = logging.getLogger(__name__)

# AARM R4 — fallback wait before a DEFERRED action becomes eligible for
# re-evaluation when the matched rule did not specify defer_seconds.
DEFAULT_DEFER_SECONDS = 300

router = APIRouter(tags=["actions"])
_threat_detector = ThreatDetector()
_pii_masker = PIIMasker()
_slack = SlackNotifier()


def _fire_escalation_webhooks(db: Session, contract: "ActionContract") -> None:
    """POST to all tenant webhooks subscribed to 'action.escalated'.

    The execution worker handles completed/failed webhooks; ESCALATED actions
    never reach the worker, so we fire from here instead.  Fire-and-forget —
    failures are logged but never re-raised.
    """
    webhooks = (
        db.query(Webhook)
        .filter(
            Webhook.tenant_id == contract.tenant_id,
            Webhook.is_active.is_(True),
        )
        .all()
    )
    payload = {
        "event": "action.escalated",
        "action_id": contract.action_id,
        "action_type": contract.action_type,
        "proposed_by": contract.proposed_by,
        "tenant_id": contract.tenant_id,
    }
    for wh in webhooks:
        if "action.escalated" not in (wh.events or []):
            continue
        try:
            httpx.post(wh.url, json=payload, timeout=5.0)
        except Exception:
            import logging
            logging.getLogger(__name__).warning(
                "Escalation webhook delivery failed url=%s action_id=%s",
                wh.url,
                contract.action_id,
                exc_info=True,
            )


@router.post("/actions", response_model=ActionAccepted, status_code=status.HTTP_201_CREATED)
def propose_action(
    action_in: ActionIn,
    db: Session = Depends(get_db),
    auth: AuthContext = Depends(get_auth_context),
) -> ActionAccepted:
    # Threat scan — runs before any DB write
    scan = _threat_detector.scan(action_in.action_type, action_in.parameters)
    if scan.is_threat:
        log = ThreatLog(
            id=str(uuid.uuid4()),
            action_id=action_in.action_id,
            tenant_id=auth.tenant_id,
            threat_types=scan.threat_types,
            threat_level=scan.threat_level,
            details=scan.details,
        )
        db.add(log)
        db.commit()

        if scan.threat_level == "critical":
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail={"threat_detected": True, "threat_level": scan.threat_level, "details": scan.details},
            )
        if scan.threat_level == "high":
            # Persist the action as DENIED without executing
            contract = ActionContract(
                action_id=action_in.action_id,
                tenant_id=auth.tenant_id,
                proposed_by=action_in.proposed_by,
                action_type=action_in.action_type,
                target_entity=action_in.target_entity,
                target_system=action_in.target_system,
                parameters=action_in.parameters,
                context=action_in.context,
                status=ActionStatus.DENIED,
                mode=action_in.mode,
                trust_source=auth.trust_source,
            )
            try:
                db.add(contract)
                db.commit()
            except Exception:
                db.rollback()
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail={"threat_detected": True, "threat_level": scan.threat_level, "details": scan.details},
            )
        # low/medium: log and proceed — policy engine makes the final call

    # AARM R6 — layer 1: enforce identity binding when the API key is scoped
    # to a specific agent. A key-scoped caller MUST NOT impersonate another agent.
    if auth.agent_id and action_in.proposed_by != auth.agent_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                f"Identity mismatch: API key is bound to agent '{auth.agent_id}' "
                f"but proposed_by is '{action_in.proposed_by}'"
            ),
        )

    # Mask PII/sensitive fields before persisting — raw payload is never stored
    masked_parameters = _pii_masker.mask(action_in.parameters)

    # Agent enforcement — opt-in. Unregistered proposed_by strings pass through unchanged.
    registered_agent = (
        db.query(Agent)
        .filter(
            Agent.agent_id == action_in.proposed_by,
            Agent.tenant_id == auth.tenant_id,
        )
        .first()
    )
    if registered_agent is not None:
        if not registered_agent.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Agent '{action_in.proposed_by}' is deactivated",
            )
        if registered_agent.allowed_action_types and action_in.action_type not in registered_agent.allowed_action_types:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Agent '{action_in.proposed_by}' is not permitted to propose action type '{action_in.action_type}'",
            )
        if registered_agent.rate_limit_per_hour is not None:
            window_start = datetime.now(timezone.utc) - timedelta(hours=1)
            recent_count = (
                db.query(ActionContract)
                .filter(
                    ActionContract.proposed_by == action_in.proposed_by,
                    ActionContract.tenant_id == auth.tenant_id,
                    ActionContract.created_at >= window_start,
                )
                .count()
            )
            if recent_count >= registered_agent.rate_limit_per_hour:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail=f"Agent '{action_in.proposed_by}' has exceeded its rate limit of {registered_agent.rate_limit_per_hour} actions/hour",
                )

    # AARM R6 — resolve layers 2–4 from the registered agent record (if any).
    # Unregistered agents get NULL class/unit; trust_source always comes from the key.
    resolved_agent_class = registered_agent.agent_class if registered_agent else None
    resolved_org_unit = registered_agent.org_unit if registered_agent else None

    contract = ActionContract(
        action_id=action_in.action_id,
        tenant_id=auth.tenant_id,
        proposed_by=action_in.proposed_by,
        action_type=action_in.action_type,
        target_entity=action_in.target_entity,
        target_system=action_in.target_system,
        parameters=masked_parameters,
        context=action_in.context,
        status=ActionStatus.PROPOSED,
        mode=action_in.mode,
        agent_class=resolved_agent_class,
        org_unit=resolved_org_unit,
        trust_source=auth.trust_source,
    )
    db.add(contract)
    try:
        db.flush()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Action '{action_in.action_id}' already exists",
        )

    # AARM R2 — append-only hash-chained context log. Every context field
    # produces one entry classified by sensitivity (PUBLIC/INTERNAL/PII/
    # SECRET/SYSTEM) with a tamper-evidence chain hash. Raw values are
    # never persisted in the log — only SHA-256 hashes.
    write_context_log(
        db=db,
        action_id=contract.action_id,
        tenant_id=auth.tenant_id,
        context=action_in.context,
    )
    db.commit()

    return ActionAccepted(action_id=contract.action_id, status=ActionStatus.PROPOSED)


@router.get("/actions", response_model=list[ActionOut])
def list_actions(
    entity_type: str = Query(default=None),
    entity_id: str = Query(default=None),
    status: str = Query(default=None),
    limit: int = Query(default=50, ge=1, le=200),
    db: Session = Depends(get_db),
    auth: AuthContext = Depends(get_auth_context),
) -> list[ActionOut]:
    """List action contracts, optionally filtered by entity or status."""
    q = db.query(ActionContract).filter(ActionContract.tenant_id == auth.tenant_id)
    if entity_type is not None:
        q = q.filter(ActionContract.target_entity["entity_type"].as_string() == entity_type)
    if entity_id is not None:
        q = q.filter(ActionContract.target_entity["entity_id"].as_string() == entity_id)
    if status is not None:
        q = q.filter(ActionContract.status == status)
    contracts = q.order_by(ActionContract.created_at.desc()).limit(limit).all()
    return [ActionOut.model_validate(c) for c in contracts]


@router.get("/actions/{action_id}", response_model=ActionOut)
def get_action(
    action_id: str,
    db: Session = Depends(get_db),
    auth: AuthContext = Depends(get_auth_context),
) -> ActionOut:
    contract = (
        db.query(ActionContract)
        .filter(
            ActionContract.action_id == action_id,
            ActionContract.tenant_id == auth.tenant_id,
        )
        .first()
    )
    if contract is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Action '{action_id}' not found",
        )
    return ActionOut.model_validate(contract)


class SimulateRequest(BaseModel):
    action_type: str
    parameters: dict[str, Any] = {}
    context: dict[str, Any] = {}
    entity_state: dict[str, Any] = {}
    proposed_by: str = "simulator"


class SimulateResponse(BaseModel):
    decision: str
    rule_id: str | None
    rule_version: str | None
    reason: str


@router.post("/actions/simulate", response_model=SimulateResponse)
def simulate_action(
    body: SimulateRequest,
    db: Session = Depends(get_db),
    auth: AuthContext = Depends(get_auth_context),
) -> SimulateResponse:
    """Dry-run policy evaluation. No DB writes, no receipt, no lock."""
    rules = (
        db.query(PolicyRule)
        .filter(PolicyRule.tenant_id == auth.tenant_id, PolicyRule.active.is_(True))
        .all()
    )
    rule_specs = [
        RuleSpec(
            rule_id=r.rule_id,
            rule_version=r.rule_version,
            action_type=r.action_type,
            conditions=r.conditions or {},
            decision=r.decision,
            priority=r.priority,
            defer_seconds=r.defer_seconds,
            max_defer_attempts=r.max_defer_attempts,
            modify_patch=r.modify_patch,
        )
        for r in rules
    ]
    mock_action = types.SimpleNamespace(
        action_type=body.action_type,
        parameters=body.parameters,
        context=body.context,
    )
    decision = PolicyEvaluator().evaluate(mock_action, body.entity_state, [], rule_specs)
    return SimulateResponse(
        decision=decision.decision,
        rule_id=decision.rule_id,
        rule_version=decision.rule_version,
        reason=decision.reason,
    )


@router.post("/actions/{action_id}/evaluate", response_model=EvaluateResponse)
def evaluate_action(
    action_id: str,
    db: Session = Depends(get_db),
    auth: AuthContext = Depends(get_auth_context),
) -> EvaluateResponse:
    # 1. Load action (tenant-scoped)
    contract = (
        db.query(ActionContract)
        .filter(
            ActionContract.action_id == action_id,
            ActionContract.tenant_id == auth.tenant_id,
        )
        .first()
    )
    if contract is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Action '{action_id}' not found",
        )
    if contract.status not in (ActionStatus.PROPOSED, ActionStatus.EVALUATING):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Action '{action_id}' is already in status '{contract.status}'",
        )

    # 1a. Kill switch check — short-circuit before any policy evaluation
    ks = db.query(KillSwitch).filter(
        KillSwitch.tenant_id == auth.tenant_id,
        KillSwitch.active.is_(True),
    ).first()
    if ks:
        ks_receipt_id = str(uuid.uuid4())
        ks_now = datetime.now(timezone.utc)
        ks_canonical = {
            "receipt_id": ks_receipt_id,
            "action_id": action_id,
            "decision": "DENIED",
            "rule_id": None,
            "rule_version": None,
            "approved_by": "kill_switch",
            "executed_at": None,
            "execution_result": None,
            "created_at": ks_now.isoformat(),
        }
        ks_receipt = Receipt(
            receipt_id=ks_receipt_id,
            action_id=action_id,
            decision="DENIED",
            rule_id=None,
            rule_version=None,
            approved_by="kill_switch",
            executed_at=None,
            execution_result=None,
            hash=canonical_state_hash(ks_canonical),
            conditions_evaluated=None,
            entity_state_snapshot={},
            created_at=ks_now,
        )
        contract.status = ActionStatus.DENIED
        contract.updated_at = ks_now
        db.add(ks_receipt)
        db.commit()
        return EvaluateResponse(
            action_id=action_id,
            receipt_id=ks_receipt_id,
            decision="DENIED",
            rule_id=None,
            rule_version=None,
            reason="kill_switch_active",
        )

    # 2. Load entity state (best-effort; empty dict if not yet materialized)
    target = contract.target_entity  # {"entity_type": ..., "entity_id": ...}
    entity_type = target.get("entity_type", "")
    entity_id = target.get("entity_id", "")
    entity_row = (
        db.query(EntityState)
        .filter(
            EntityState.tenant_id == auth.tenant_id,
            EntityState.entity_type == entity_type,
            EntityState.entity_id == entity_id,
        )
        .first()
    )
    entity_state: dict = entity_row.state if entity_row else {}

    # 3. Load active policy rules for this action_type
    db_rules = (
        db.query(PolicyRule)
        .filter(
            PolicyRule.action_type == contract.action_type,
            PolicyRule.active.is_(True),
        )
        .all()
    )
    rule_specs = [
        RuleSpec(
            rule_id=r.rule_id,
            rule_version=r.rule_version,
            action_type=r.action_type,
            conditions=r.conditions,
            decision=r.decision,
            priority=r.priority,
            defer_seconds=r.defer_seconds,
            max_defer_attempts=r.max_defer_attempts,
            modify_patch=r.modify_patch,
        )
        for r in db_rules
    ]

    # 4. Evaluate — pure function, no side effects
    decision = PolicyEvaluator().evaluate(
        action=contract,
        entity_state=entity_state,
        event_history=[],
        rules=rule_specs,
    )

    # 5. Compute per-condition evaluation trace for the matched rule
    conditions_evaluated: dict[str, Any] | None = None
    if decision.rule_id is not None:
        matched_rule = next((r for r in db_rules if r.rule_id == decision.rule_id), None)
        if matched_rule:
            evaluator = PolicyEvaluator()
            conditions_evaluated = {}
            for key, expected in matched_rule.conditions.items():
                passed = evaluator._check(key, expected, entity_state, [])
                if key == "churn_risk":
                    conditions_evaluated[key] = {
                        "label": "Churn Risk",
                        "expected": expected,
                        "actual": entity_state.get("churn_risk"),
                        "passed": passed,
                    }
                elif key == "min_ltv":
                    conditions_evaluated[key] = {
                        "label": f"LTV ≥ {expected}",
                        "threshold": expected,
                        "actual": entity_state.get("ltv"),
                        "passed": passed,
                    }
                elif key == "no_discount_days":
                    last_discount = entity_state.get("last_discount_at")
                    conditions_evaluated[key] = {
                        "label": f"No discount in {expected} days",
                        "days": expected,
                        "actual_last_discount": str(last_discount) if last_discount else None,
                        "passed": passed,
                    }
                else:
                    conditions_evaluated[key] = {
                        "label": key,
                        "expected": expected,
                        "passed": passed,
                    }

    # 6. AARM R4 — apply DEFER / MODIFY runtime transformations.
    # The policy engine is pure; the *effects* of DEFER (timeout cascade +
    # attempt cap) and MODIFY (parameter patch) are computed here so the
    # receipt records what actually happened.
    effective_decision = decision.decision
    effective_reason = decision.reason
    modified_parameters: dict[str, Any] | None = None

    if decision.decision == "DEFERRED":
        next_defer_count = contract.defer_count + 1
        if (
            decision.max_defer_attempts is not None
            and next_defer_count > decision.max_defer_attempts
        ):
            # AARM R4 — max_defer_attempts exceeded collapses to DENY.
            effective_decision = "DENIED"
            effective_reason = (
                f"Auto-denied after {contract.defer_count} defer(s); "
                f"exceeds max_defer_attempts={decision.max_defer_attempts} "
                f"on rule '{decision.rule_id}'."
            )
    elif decision.decision == "MODIFIED" and decision.modify_patch:
        # Shallow-merge the rule's modify_patch into the contract's parameters.
        # The worker will dispatch the *patched* parameters; the original are
        # preserved only in the hash chain of the immutable receipt payload.
        patched = dict(contract.parameters or {})
        patched.update(decision.modify_patch)
        modified_parameters = patched

    # 7. Build receipt — generate id + timestamp in Python so they can be hashed
    receipt_id = str(uuid.uuid4())
    created_at = datetime.now(timezone.utc)
    receipt_canonical = {
        "receipt_id": receipt_id,
        "action_id": action_id,
        "decision": effective_decision,
        "rule_id": decision.rule_id,
        "rule_version": decision.rule_version,
        "approved_by": "policy_engine",
        "executed_at": None,
        "execution_result": None,
        "created_at": created_at.isoformat(),
    }
    receipt_hash = canonical_state_hash(receipt_canonical)

    # AARM R5 — sign the canonical signing payload with the active Ed25519
    # key. If no key is configured (dev env), fall back to unsigned receipt
    # (NULL signature columns) and log once; in production the API boot
    # should fail fast rather than silently ship unsigned receipts.
    signature: str | None = None
    signature_alg: str | None = None
    public_key_id: str | None = None
    try:
        active_kid = get_active_key_id()
        payload = canonical_signing_payload(
            receipt_id=receipt_id,
            action_id=action_id,
            decision=effective_decision,
            rule_id=decision.rule_id,
            rule_version=decision.rule_version,
            hash_hex=receipt_hash,
            created_at_iso=created_at.isoformat(),
            public_key_id=active_kid,
        )
        signature = sign_receipt_payload(payload)
        signature_alg = SIGNATURE_ALG
        public_key_id = active_kid
    except KeyNotConfiguredError:
        _signing_log.warning(
            "STATIS_SIGNING_PRIVATE_KEY not configured — receipt %s written "
            "without Ed25519 signature. AARM R5 requires signed receipts in "
            "production; set the env var before claiming compliance.",
            receipt_id,
        )

    receipt = Receipt(
        receipt_id=receipt_id,
        action_id=action_id,
        decision=effective_decision,
        rule_id=decision.rule_id,
        rule_version=decision.rule_version,
        approved_by="policy_engine",
        executed_at=None,
        execution_result=None,
        hash=receipt_hash,
        signature=signature,
        signature_alg=signature_alg,
        public_key_id=public_key_id,
        conditions_evaluated=conditions_evaluated,
        entity_state_snapshot=dict(entity_state),
        created_at=created_at,
        mode=contract.mode,
    )

    # 8. Persist receipt + status update atomically in one transaction.
    # Shadow actions: write receipt but skip execution — terminal status SHADOW_COMPLETE.
    # Live actions:
    #   APPROVED → worker dispatches.
    #   MODIFIED w/ patch → apply patch, set status=APPROVED, worker dispatches
    #     the patched parameters. Receipt.decision stays "MODIFIED" for audit.
    #   MODIFIED w/o patch → status=MODIFIED, non-dispatchable (fail-closed).
    #   DEFERRED → schedule deferred_until and increment defer_count. The caller
    #     POSTs to /actions/{id}/reevaluate after deferred_until to retry.
    #   Any other (DENIED, STEP_UP, ESCALATED) → persists decision as status.
    # AARM R4: no effects MUST occur on denied or deferred actions.
    now = datetime.now(timezone.utc)
    if contract.mode == "shadow":
        contract.status = ActionStatus.SHADOW_COMPLETE
        receipt.executed_at = None
        receipt.execution_result = {}
    elif effective_decision == "APPROVED":
        contract.status = ActionStatus.APPROVED
    elif effective_decision == "MODIFIED":
        if modified_parameters is not None:
            contract.parameters = modified_parameters
            contract.status = ActionStatus.APPROVED
        else:
            contract.status = ActionStatus.MODIFIED
    elif effective_decision == "DEFERRED":
        wait_seconds = decision.defer_seconds or DEFAULT_DEFER_SECONDS
        contract.deferred_until = now + timedelta(seconds=wait_seconds)
        contract.defer_count = contract.defer_count + 1
        contract.status = ActionStatus.DEFERRED
    else:
        contract.status = effective_decision
    contract.updated_at = now
    db.add(receipt)
    db.commit()

    # Fire escalation notifications after commit — Slack + outbound webhooks.
    # STEP_UP is the AARM-canonical form of the legacy ESCALATED decision.
    if effective_decision in ("ESCALATED", "STEP_UP"):
        _slack.notify_escalation(
            action_id=action_id,
            action_type=contract.action_type,
            proposed_by=contract.proposed_by,
            tenant_id=auth.tenant_id,
        )
        _fire_escalation_webhooks(db, contract)

    return EvaluateResponse(
        action_id=action_id,
        receipt_id=receipt_id,
        decision=effective_decision,
        rule_id=decision.rule_id,
        rule_version=decision.rule_version,
        reason=effective_reason,
    )


@router.post("/actions/{action_id}/reevaluate", response_model=EvaluateResponse)
def reevaluate_action(
    action_id: str,
    db: Session = Depends(get_db),
    auth: AuthContext = Depends(get_auth_context),
) -> EvaluateResponse:
    """AARM R4 — re-evaluate a DEFERRED action after its wait window elapses.

    A DEFERRED action sits in a holding pattern until ``deferred_until``.
    Callers POST here once the timer has passed; this resets the contract
    to PROPOSED and runs the evaluator again. The fresh decision may be
    ALLOW, DENY, STEP_UP, MODIFIED — or DEFERRED again (defer_count++).
    If max_defer_attempts is exceeded on the re-run it auto-denies.
    """
    contract = (
        db.query(ActionContract)
        .filter(
            ActionContract.action_id == action_id,
            ActionContract.tenant_id == auth.tenant_id,
        )
        .first()
    )
    if contract is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Action '{action_id}' not found",
        )
    if contract.status != ActionStatus.DEFERRED:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                f"Action '{action_id}' is in status '{contract.status}', "
                "expected DEFERRED"
            ),
        )
    now = datetime.now(timezone.utc)
    if contract.deferred_until is not None:
        deferred_until = contract.deferred_until
        if deferred_until.tzinfo is None:
            deferred_until = deferred_until.replace(tzinfo=timezone.utc)
        if deferred_until > now:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    f"Action '{action_id}' is still deferred until "
                    f"{deferred_until.isoformat()}"
                ),
            )

    # Reset to PROPOSED so evaluate_action's status gate accepts the action.
    # defer_count is preserved so the max_defer_attempts cap counts across
    # re-evaluations, as required by AARM R4.
    contract.status = ActionStatus.PROPOSED
    contract.deferred_until = None
    contract.updated_at = now
    db.flush()

    return evaluate_action(action_id=action_id, db=db, auth=auth)


@router.patch("/actions/{action_id}/complete", response_model=ActionOut)
def complete_action(
    action_id: str,
    body: ActionCompleteIn,
    db: Session = Depends(get_db),
    auth: AuthContext = Depends(get_auth_context),
) -> ActionOut:
    """Agent reports execution result after running an approved action."""
    contract = (
        db.query(ActionContract)
        .filter(
            ActionContract.action_id == action_id,
            ActionContract.tenant_id == auth.tenant_id,
        )
        .first()
    )
    if contract is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Action '{action_id}' not found",
        )

    receipt = db.query(Receipt).filter(Receipt.action_id == action_id).first()
    if receipt is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No receipt for action '{action_id}'",
        )

    now = datetime.now(timezone.utc)
    receipt.execution_result = body.execution_result
    if receipt.executed_at is None:
        receipt.executed_at = now
    contract.status = ActionStatus.COMPLETED
    contract.updated_at = now
    db.commit()
    db.refresh(contract)
    return ActionOut.model_validate(contract)


# ---------------------------------------------------------------------------
# Escalation review endpoints
# ---------------------------------------------------------------------------


@router.get("/escalations", response_model=list[EscalatedActionOut])
def list_escalated_actions(
    db: Session = Depends(get_db),
    auth: AuthContext = Depends(get_auth_context),
) -> list[EscalatedActionOut]:
    """Return all actions awaiting human review for the tenant.

    Covers legacy ESCALATED and AARM-canonical STEP_UP — they are semantically
    the same class of decision (AARM R4 STEP_UP == legacy ESCALATED).
    """
    contracts = (
        db.query(ActionContract)
        .filter(
            ActionContract.tenant_id == auth.tenant_id,
            ActionContract.status.in_([ActionStatus.ESCALATED, ActionStatus.STEP_UP]),
        )
        .order_by(ActionContract.created_at.asc())
        .all()
    )
    return [EscalatedActionOut.model_validate(c) for c in contracts]


def _handle_escalation_review(
    action_id: str,
    review_in: EscalationReviewIn,
    reviewer_decision: str,  # "APPROVED" | "REJECTED"
    db: Session,
    auth: AuthContext,
) -> ActionOut:
    contract = (
        db.query(ActionContract)
        .filter(
            ActionContract.action_id == action_id,
            ActionContract.tenant_id == auth.tenant_id,
        )
        .first()
    )
    if contract is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Action '{action_id}' not found",
        )
    if contract.status not in (ActionStatus.ESCALATED, ActionStatus.STEP_UP):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                f"Action '{action_id}' is in status '{contract.status}', "
                "expected ESCALATED or STEP_UP"
            ),
        )

    # Write the audit record
    review = EscalationReview(
        review_id=str(uuid.uuid4()),
        action_id=action_id,
        reviewer_id=review_in.reviewer_id,
        reviewer_decision=reviewer_decision,
        reviewer_note=review_in.note,
        reviewed_at=datetime.now(timezone.utc),
    )
    db.add(review)

    # Transition: REJECTED → DENIED, APPROVED → APPROVED (worker picks up)
    new_status = ActionStatus.APPROVED if reviewer_decision == "APPROVED" else ActionStatus.DENIED
    contract.status = new_status
    contract.updated_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(contract)
    return ActionOut.model_validate(contract)


@router.post("/actions/{action_id}/approve", response_model=ActionOut)
def approve_escalated_action(
    action_id: str,
    review_in: EscalationReviewIn,
    db: Session = Depends(get_db),
    auth: AuthContext = Depends(get_auth_context),
) -> ActionOut:
    """Approve an ESCALATED action — transitions to APPROVED so the worker executes it."""
    return _handle_escalation_review(action_id, review_in, "APPROVED", db, auth)


@router.post("/actions/{action_id}/reject", response_model=ActionOut)
def reject_escalated_action(
    action_id: str,
    review_in: EscalationReviewIn,
    db: Session = Depends(get_db),
    auth: AuthContext = Depends(get_auth_context),
) -> ActionOut:
    """Reject an ESCALATED action — transitions to DENIED."""
    return _handle_escalation_review(action_id, review_in, "REJECTED", db, auth)


# ---------------------------------------------------------------------------
# AARM R2 — context log retrieval + chain verification
# ---------------------------------------------------------------------------


@router.get("/actions/{action_id}/context-log", response_model=ContextLogVerifyOut)
def get_context_log(
    action_id: str,
    db: Session = Depends(get_db),
    auth: AuthContext = Depends(get_auth_context),
) -> ContextLogVerifyOut:
    """Return the append-only context log for an action with chain validity.

    Pre-AARM-R2 actions have no entries and return chain_valid=True with
    sequence_count=0 (vacuously valid). A False chain_valid indicates the
    log has been tampered with (insertion, deletion, reorder, or content
    mutation) and the auditor must not trust the context provenance.
    """
    contract = (
        db.query(ActionContract)
        .filter(
            ActionContract.action_id == action_id,
            ActionContract.tenant_id == auth.tenant_id,
        )
        .first()
    )
    if contract is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Action '{action_id}' not found",
        )

    entries = (
        db.query(ContextLogEntry)
        .filter(
            ContextLogEntry.action_id == action_id,
            ContextLogEntry.tenant_id == auth.tenant_id,
        )
        .order_by(ContextLogEntry.sequence.asc())
        .all()
    )
    return ContextLogVerifyOut(
        action_id=action_id,
        sequence_count=len(entries),
        chain_valid=verify_chain(entries),
        entries=[ContextLogEntryOut.model_validate(e) for e in entries],
    )
