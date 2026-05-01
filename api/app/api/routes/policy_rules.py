from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.api.deps import AuthContext, get_auth_context
from app.db.session import get_db
from app.models.policy_rule import PolicyRule
from app.schemas.policy_rules import PolicyRuleIn, PolicyRuleOut, PolicyRuleUpdate

router = APIRouter(tags=["policy-rules"])


@router.post("/policy-rules", response_model=PolicyRuleOut, status_code=status.HTTP_201_CREATED)
def create_policy_rule(
    rule_in: PolicyRuleIn,
    db: Session = Depends(get_db),
    auth: AuthContext = Depends(get_auth_context),
) -> PolicyRuleOut:
    # Check for duplicate rule_id within this tenant
    existing = (
        db.query(PolicyRule)
        .filter(
            PolicyRule.tenant_id == auth.tenant_id,
            PolicyRule.rule_id == rule_in.rule_id,
        )
        .first()
    )
    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Policy rule '{rule_in.rule_id}' already exists for this tenant",
        )

    rule = PolicyRule(
        rule_id=rule_in.rule_id,
        tenant_id=auth.tenant_id,
        rule_version=rule_in.rule_version,
        action_type=rule_in.action_type,
        conditions=rule_in.conditions,
        decision=rule_in.decision,
        priority=rule_in.priority,
        active=rule_in.active,
        description=rule_in.description,
        defer_seconds=rule_in.defer_seconds,
        max_defer_attempts=rule_in.max_defer_attempts,
        modify_patch=rule_in.modify_patch,
    )
    db.add(rule)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Policy rule '{rule_in.rule_id}' already exists for this tenant",
        )
    db.refresh(rule)
    return PolicyRuleOut.model_validate(rule)


@router.get("/policy-rules/{rule_id}", response_model=PolicyRuleOut)
def get_policy_rule(
    rule_id: str,
    db: Session = Depends(get_db),
    auth: AuthContext = Depends(get_auth_context),
) -> PolicyRuleOut:
    rule = (
        db.query(PolicyRule)
        .filter(
            PolicyRule.rule_id == rule_id,
            PolicyRule.tenant_id == auth.tenant_id,
        )
        .first()
    )
    if rule is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Policy rule '{rule_id}' not found",
        )
    return PolicyRuleOut.model_validate(rule)


@router.get("/policy-rules", response_model=list[PolicyRuleOut])
def list_policy_rules(
    action_type: str = Query(None),
    db: Session = Depends(get_db),
    auth: AuthContext = Depends(get_auth_context),
) -> list[PolicyRuleOut]:
    q = db.query(PolicyRule).filter(PolicyRule.tenant_id == auth.tenant_id)
    if action_type is not None:
        q = q.filter(PolicyRule.action_type == action_type)
    rules = q.order_by(PolicyRule.priority.desc(), PolicyRule.rule_id).all()
    return [PolicyRuleOut.model_validate(r) for r in rules]


@router.put("/policy-rules/{rule_id}", response_model=PolicyRuleOut)
def update_policy_rule(
    rule_id: str,
    rule_update: PolicyRuleUpdate,
    db: Session = Depends(get_db),
    auth: AuthContext = Depends(get_auth_context),
) -> PolicyRuleOut:
    rule = (
        db.query(PolicyRule)
        .filter(
            PolicyRule.rule_id == rule_id,
            PolicyRule.tenant_id == auth.tenant_id,
        )
        .first()
    )
    if rule is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Policy rule '{rule_id}' not found",
        )

    update_data = rule_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(rule, field, value)

    db.commit()
    db.refresh(rule)
    return PolicyRuleOut.model_validate(rule)


@router.delete("/policy-rules/{rule_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_policy_rule(
    rule_id: str,
    db: Session = Depends(get_db),
    auth: AuthContext = Depends(get_auth_context),
) -> None:
    rule = (
        db.query(PolicyRule)
        .filter(
            PolicyRule.rule_id == rule_id,
            PolicyRule.tenant_id == auth.tenant_id,
        )
        .first()
    )
    if rule is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Policy rule '{rule_id}' not found",
        )
    db.delete(rule)
    db.commit()
