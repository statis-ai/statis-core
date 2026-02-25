from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import AuthContext, get_auth_context
from app.db.session import get_db
from app.models.event import Event
from app.repositories.events import insert_event_idempotent
from app.schemas.events import EventAccepted, EventIn, EventOut

router = APIRouter(tags=["events"])


@router.post("/events", response_model=EventAccepted)
def ingest_event(
    event_in: EventIn,
    response: Response,
    db: Session = Depends(get_db),
    auth: AuthContext = Depends(get_auth_context),
) -> EventAccepted:
    inserted = insert_event_idempotent(db, event_in, auth.tenant_id)
    response.status_code = status.HTTP_201_CREATED if inserted else status.HTTP_200_OK
    return EventAccepted(event_id=event_in.event_id)


@router.get("/events", response_model=List[EventOut])
def query_events(
    entity_type: Optional[str] = Query(default=None),
    entity_id: Optional[str] = Query(default=None),
    since: Optional[datetime] = Query(default=None),
    until: Optional[datetime] = Query(default=None),
    limit: int = Query(default=50, ge=1, le=200),
    db: Session = Depends(get_db),
    auth: AuthContext = Depends(get_auth_context),
) -> List[EventOut]:
    from app.rbac import filter_events_for_role

    stmt = select(Event).where(Event.tenant_id == auth.tenant_id)

    if entity_type is not None:
        stmt = stmt.where(Event.entity_type == entity_type)
    if entity_id is not None:
        stmt = stmt.where(Event.entity_id == entity_id)
    if since is not None:
        stmt = stmt.where(Event.occurred_at >= since)
    if until is not None:
        stmt = stmt.where(Event.occurred_at <= until)

    stmt = stmt.order_by(
        Event.occurred_at.asc(),
        Event.ingested_at.asc(),
        Event.event_id.asc(),
    ).limit(limit)

    rows = db.execute(stmt).scalars().all()
    filtered = filter_events_for_role(rows, auth.role)
    return [EventOut.model_validate(r) for r in filtered]
