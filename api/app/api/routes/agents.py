from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import AuthContext, get_auth_context
from app.db.session import get_db
from app.models.action_contract import ActionContract
from app.models.agent import Agent
from app.schemas.actions import ActionStatus
from app.schemas.agents import AgentCreate, AgentOut, AgentUpdate
from app.schemas.approval import AgentIdentitySnapshot

router = APIRouter(tags=["agents"])


@router.post("/agents", response_model=AgentOut, status_code=status.HTTP_201_CREATED)
def register_agent(
    body: AgentCreate,
    db: Session = Depends(get_db),
    auth: AuthContext = Depends(get_auth_context),
) -> AgentOut:
    """Register an agent. Idempotent — re-registering updates the record."""
    existing = (
        db.query(Agent)
        .filter(Agent.agent_id == body.agent_id, Agent.tenant_id == auth.tenant_id)
        .first()
    )
    if existing:
        existing.name = body.name
        existing.allowed_action_types = body.allowed_action_types
        existing.rate_limit_per_hour = body.rate_limit_per_hour
        existing.is_active = True
        db.commit()
        db.refresh(existing)
        return AgentOut.model_validate(existing)

    agent = Agent(
        agent_id=body.agent_id,
        tenant_id=auth.tenant_id,
        name=body.name,
        allowed_action_types=body.allowed_action_types,
        rate_limit_per_hour=body.rate_limit_per_hour,
        is_active=True,
    )
    db.add(agent)
    db.commit()
    db.refresh(agent)
    return AgentOut.model_validate(agent)


@router.get("/agents", response_model=list[AgentOut])
def list_agents(
    db: Session = Depends(get_db),
    auth: AuthContext = Depends(get_auth_context),
) -> list[AgentOut]:
    agents = (
        db.query(Agent)
        .filter(Agent.tenant_id == auth.tenant_id)
        .order_by(Agent.created_at.desc())
        .all()
    )
    return [AgentOut.model_validate(a) for a in agents]


@router.patch("/agents/{agent_id}", response_model=AgentOut)
def update_agent(
    agent_id: str,
    body: AgentUpdate,
    db: Session = Depends(get_db),
    auth: AuthContext = Depends(get_auth_context),
) -> AgentOut:
    agent = (
        db.query(Agent)
        .filter(Agent.agent_id == agent_id, Agent.tenant_id == auth.tenant_id)
        .first()
    )
    if agent is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Agent not found")
    if body.name is not None:
        agent.name = body.name
    if body.allowed_action_types is not None:
        agent.allowed_action_types = body.allowed_action_types
    if body.rate_limit_per_hour is not None:
        agent.rate_limit_per_hour = body.rate_limit_per_hour
    if body.is_active is not None:
        agent.is_active = body.is_active
    db.commit()
    db.refresh(agent)
    return AgentOut.model_validate(agent)


@router.get("/agents/{agent_id}/identity", response_model=AgentIdentitySnapshot)
def get_agent_identity(
    agent_id: str,
    db: Session = Depends(get_db),
    auth: AuthContext = Depends(get_auth_context),
) -> AgentIdentitySnapshot:
    """Live identity card for the operator console.

    Powers the right-hand panel on the escalation queue — same shape as the
    snapshot frozen on `action_contracts.agent_identity_snapshot`, but recomputed
    from current data. The token-gated public approval page reads the frozen
    snapshot off the contract; this endpoint is for in-app callers that want
    today's counters.
    """
    agent = (
        db.query(Agent)
        .filter(Agent.agent_id == agent_id, Agent.tenant_id == auth.tenant_id)
        .first()
    )
    if agent is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Agent not found")

    since = datetime.now(timezone.utc) - timedelta(hours=24)
    actions_today = (
        db.query(ActionContract)
        .filter(
            ActionContract.tenant_id == auth.tenant_id,
            ActionContract.proposed_by == agent_id,
            ActionContract.decided_at >= since,
        )
        .count()
    )
    denied_today = (
        db.query(ActionContract)
        .filter(
            ActionContract.tenant_id == auth.tenant_id,
            ActionContract.proposed_by == agent_id,
            ActionContract.decided_at >= since,
            ActionContract.status == ActionStatus.DENIED,
        )
        .count()
    )

    return AgentIdentitySnapshot(
        handle=agent.agent_id,
        version=None,
        spawned_by=None,
        actions_today=actions_today,
        denied_today=denied_today,
        agent_class=agent.agent_class,
        org_unit=agent.org_unit,
        trust_source=auth.trust_source,
    )


@router.delete("/agents/{agent_id}", status_code=status.HTTP_204_NO_CONTENT)
def deactivate_agent(
    agent_id: str,
    db: Session = Depends(get_db),
    auth: AuthContext = Depends(get_auth_context),
) -> None:
    """Soft-delete: sets is_active=False."""
    agent = (
        db.query(Agent)
        .filter(Agent.agent_id == agent_id, Agent.tenant_id == auth.tenant_id)
        .first()
    )
    if agent is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Agent not found")
    agent.is_active = False
    db.commit()
