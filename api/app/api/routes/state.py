from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import AuthContext, get_auth_context
from app.db.session import get_db
from app.models.entity_state import EntityState
from app.models.event import Event
from app.repositories.state_replay import compute_state_at_rev
from app.schemas.state import EntityStateOut

router = APIRouter(tags=["state"])


@router.get("/state/{entity_type}/{entity_id}", response_model=EntityStateOut)
def get_entity_state(
    entity_type: str,
    entity_id: str,
    db: Session = Depends(get_db),
    auth: AuthContext = Depends(get_auth_context),
) -> EntityStateOut:
    from app.rbac import redact_state_for_role

    row = db.get(EntityState, (auth.tenant_id, entity_type, entity_id))
    if row is None:
        raise HTTPException(status_code=404, detail="Entity state not found")

    state = redact_state_for_role(row.state, auth.role)

    return EntityStateOut(
        entity_type=row.entity_type,
        entity_id=row.entity_id,
        state=state,
        state_version=row.state_version,
        state_hash=row.state_hash,
        last_event_id=row.last_event_id,
        provenance=row.provenance_event_ids,
    )


@router.get("/state/{entity_type}/{entity_id}/at", response_model=EntityStateOut)
def get_entity_state_at_rev(
    entity_type: str,
    entity_id: str,
    rev: int = Query(..., ge=1),
    db: Session = Depends(get_db),
    auth: AuthContext = Depends(get_auth_context),
) -> EntityStateOut:
    from app.rbac import redact_state_for_role

    row = db.get(EntityState, (auth.tenant_id, entity_type, entity_id))
    if row is None:
        raise HTTPException(status_code=404, detail="Entity state not found")

    if rev > row.state_version:
        raise HTTPException(
            status_code=400,
            detail=f"rev {rev} exceeds current state_version {row.state_version}",
        )

    event_ids = row.provenance_event_ids[:rev]
    events = (
        db.execute(
            select(Event)
            .where(Event.event_id.in_(event_ids))
            .order_by(Event.occurred_at.asc(), Event.ingested_at.asc(), Event.event_id.asc())
        )
        .scalars()
        .all()
    )

    state, state_hash, provenance = compute_state_at_rev(events, rev)
    state = redact_state_for_role(state, auth.role)

    return EntityStateOut(
        entity_type=entity_type,
        entity_id=entity_id,
        state=state,
        state_version=rev,
        state_hash=state_hash,
        last_event_id=event_ids[-1] if event_ids else None,
        provenance=provenance,
    )
