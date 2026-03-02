import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.api.deps import AuthContext, get_auth_context
from app.db.session import get_db
from app.models.action_contract import ActionContract
from app.models.entity_state import EntityState
from app.models.policy_rule import PolicyRule
from app.models.receipt import Receipt
from app.policy.evaluator import PolicyEvaluator, RuleSpec
from app.schemas.actions import ActionAccepted, ActionIn, ActionOut, ActionStatus
from app.schemas.policy import EvaluateResponse
from app.utils.hashing import canonical_state_hash

router = APIRouter(tags=["actions"])


@router.post("/actions", response_model=ActionAccepted, status_code=status.HTTP_201_CREATED)
def propose_action(
    action_in: ActionIn,
    db: Session = Depends(get_db),
    auth: AuthContext = Depends(get_auth_context),
) -> ActionAccepted:
    contract = ActionContract(
        action_id=action_in.action_id,
        tenant_id=auth.tenant_id,
        proposed_by=action_in.proposed_by,
        action_type=action_in.action_type,
        target_entity=action_in.target_entity,
        target_system=action_in.target_system,
        parameters=action_in.parameters,
        context=action_in.context,
        status=ActionStatus.PROPOSED,
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

    # 5. Build receipt — generate id + timestamp in Python so they can be hashed
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
        created_at=created_at,
    )

    # 6. Persist receipt + status update atomically in one transaction
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
