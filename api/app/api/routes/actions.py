import uuid
from datetime import datetime, timezone
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query, status
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
from app.policy.evaluator import PolicyEvaluator, RuleSpec
from app.schemas.actions import ActionAccepted, ActionCompleteIn, ActionIn, ActionOut, ActionStatus
from app.schemas.escalation import EscalatedActionOut, EscalationReviewIn, EscalationReviewOut
from app.schemas.policy import EvaluateResponse
from app.security.pii_masker import PIIMasker
from app.security.threat_detector import ThreatDetector
from app.utils.hashing import canonical_state_hash

router = APIRouter(tags=["actions"])
_threat_detector = ThreatDetector()
_pii_masker = PIIMasker()


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

    # Mask PII/sensitive fields before persisting — raw payload is never stored
    masked_parameters = _pii_masker.mask(action_in.parameters)

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
    )
    db.add(contract)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Action '{action_in.action_id}' already exists",
        )
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

    # 6. Build receipt — generate id + timestamp in Python so they can be hashed
    receipt_id = str(uuid.uuid4())
    created_at = datetime.now(timezone.utc)
    receipt_canonical = {
        "receipt_id": receipt_id,
        "action_id": action_id,
        "decision": decision.decision,
        "rule_id": decision.rule_id,
        "rule_version": decision.rule_version,
        "approved_by": "policy_engine",
        "executed_at": None,
        "execution_result": None,
        "created_at": created_at.isoformat(),
    }
    receipt_hash = canonical_state_hash(receipt_canonical)

    receipt = Receipt(
        receipt_id=receipt_id,
        action_id=action_id,
        decision=decision.decision,
        rule_id=decision.rule_id,
        rule_version=decision.rule_version,
        approved_by="policy_engine",
        executed_at=None,
        execution_result=None,
        hash=receipt_hash,
        conditions_evaluated=conditions_evaluated,
        entity_state_snapshot=dict(entity_state),
        created_at=created_at,
        mode=contract.mode,
    )

    # 7. Persist receipt + status update atomically in one transaction.
    # Shadow actions: write receipt but skip execution — terminal status SHADOW_COMPLETE.
    # Live actions: APPROVED → COMPLETED (worker not needed), DENIED/ESCALATED keep decision.
    if contract.mode == "shadow":
        contract.status = ActionStatus.SHADOW_COMPLETE
        receipt.executed_at = None
        receipt.execution_result = {}
    elif decision.decision == "APPROVED":
        contract.status = ActionStatus.COMPLETED
        receipt.executed_at = created_at
    else:
        contract.status = decision.decision
    contract.updated_at = datetime.now(timezone.utc)
    db.add(receipt)
    db.commit()

    return EvaluateResponse(
        action_id=action_id,
        receipt_id=receipt_id,
        decision=decision.decision,
        rule_id=decision.rule_id,
        rule_version=decision.rule_version,
        reason=decision.reason,
    )


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
    """Return all ESCALATED action contracts for the tenant (admin queue view)."""
    contracts = (
        db.query(ActionContract)
        .filter(
            ActionContract.tenant_id == auth.tenant_id,
            ActionContract.status == ActionStatus.ESCALATED,
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
    if contract.status != ActionStatus.ESCALATED:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Action '{action_id}' is in status '{contract.status}', expected ESCALATED",
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
