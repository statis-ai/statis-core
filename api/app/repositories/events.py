import uuid
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.delivery import Delivery
from app.models.entity_state import EntityState
from app.models.event import Event
from app.models.subscription import Subscription
from app.reducers.registry import has_reducer, get_reducer
from app.schemas.events import EventIn
from app.utils.hashing import canonical_state_hash


def _materialize(db: Session, event: Event, tenant_id: str) -> Optional[EntityState]:
    """Apply the reducer for this event and upsert entity_state (SELECT FOR UPDATE).

    Returns the entity_state row when state was changed, None otherwise.
    """
    if not has_reducer(event.event_type):
        return None

    reducer = get_reducer(event.event_type)

    row = db.execute(
        select(EntityState)
        .where(
            EntityState.tenant_id == tenant_id,
            EntityState.entity_type == event.entity_type,
            EntityState.entity_id == event.entity_id,
        )
        .with_for_update()
    ).scalar_one_or_none()

    old_state = row.state if row is not None else {}
    new_state = reducer(old_state, event)
    new_hash = canonical_state_hash(new_state)

    if row is None:
        row = EntityState(
            tenant_id=tenant_id,
            entity_type=event.entity_type,
            entity_id=event.entity_id,
            state=new_state,
            state_version=1,
            last_event_id=event.event_id,
            last_occurred_at=event.occurred_at,
            state_hash=new_hash,
            materialized_at=datetime.now(timezone.utc),
            provenance_event_ids=[event.event_id],
        )
        db.add(row)
        db.flush()
        return row
    else:
        row.state = new_state
        row.state_version += 1
        row.last_event_id = event.event_id
        row.last_occurred_at = event.occurred_at
        row.state_hash = new_hash
        row.materialized_at = datetime.now(timezone.utc)
        row.provenance_event_ids = row.provenance_event_ids + [event.event_id]
        db.flush()
        return row


def _enqueue_deliveries(
    db: Session, entity_state: EntityState, event_type: str, tenant_id: str
) -> None:
    """Create pending deliveries for active subscriptions matching this state change."""
    subs = db.execute(
        select(Subscription).where(
            Subscription.tenant_id == tenant_id,
            Subscription.entity_type == entity_state.entity_type,
            Subscription.status == "active",
        )
    ).scalars().all()

    for sub in subs:
        if sub.event_types is not None and event_type not in sub.event_types:
            continue

        dedupe_key = (
            f"{tenant_id}:{sub.subscription_id}:{entity_state.entity_type}"
            f":{entity_state.entity_id}:{entity_state.state_version}"
        )

        stmt = (
            pg_insert(Delivery)
            .values(
                delivery_id=str(uuid.uuid4()),
                tenant_id=tenant_id,
                subscription_id=sub.subscription_id,
                entity_type=entity_state.entity_type,
                entity_id=entity_state.entity_id,
                state_version=entity_state.state_version,
                dedupe_key=dedupe_key,
                status="pending",
                attempt_count=0,
            )
            .on_conflict_do_nothing(index_elements=["dedupe_key"])
        )
        db.execute(stmt)


def insert_event_idempotent(db: Session, event_in: EventIn, tenant_id: str) -> bool:
    """Insert event + materialize state + enqueue deliveries. Return True when inserted, False on duplicate."""
    event = Event(
        event_id=event_in.event_id,
        tenant_id=tenant_id,
        entity_type=event_in.entity_type,
        entity_id=event_in.entity_id,
        event_type=event_in.event_type,
        payload=event_in.payload,
        occurred_at=event_in.occurred_at,
        producer=event_in.producer,
        schema_version=event_in.schema_version,
        trace_id=event_in.trace_id,
    )
    db.add(event)
    try:
        db.flush()
    except IntegrityError as exc:
        db.rollback()
        existing = db.get(Event, event_in.event_id)
        if existing is not None:
            return False
        raise exc

    entity_state = _materialize(db, event, tenant_id)
    if entity_state is not None:
        _enqueue_deliveries(db, entity_state, event.event_type, tenant_id)

    db.commit()
    return True
