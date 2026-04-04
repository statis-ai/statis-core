from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import AuthContext, get_auth_context
from app.db.session import get_db
from app.models.agent import Agent
from app.schemas.agents import AgentCreate, AgentOut, AgentUpdate

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
