import logging
import time
import uuid
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import select, update as sa_update
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.delivery import Delivery
from app.models.entity_state import EntityState
from app.models.event import Event
from app.models.quarantine import QuarantineEntry
from app.models.subscription import Subscription
from app.reducers.registry import has_reducer, get_reducer
from app.reducers.sandbox import ReducerError, ReducerTimeoutError, run_reducer_safely
from app.reducers.validation import ReducerOutputInvalid, validate_reducer_output
from app.schemas.events import EventIn
from app.utils.hashing import canonical_state_hash

logger = logging.getLogger(__name__)

MAX_MATERIALIZE_RETRIES = 5
QUARANTINE_THRESHOLD = 3


def _is_quarantined(
    db: Session, tenant_id: str, entity_type: str, entity_id: str
) -> bool:
    entry = db.execute(
        select(QuarantineEntry).where(
            QuarantineEntry.tenant_id == tenant_id,
            QuarantineEntry.entity_type == entity_type,
            QuarantineEntry.entity_id == entity_id,
            QuarantineEntry.quarantined_at.isnot(None),
        )
    ).scalar_one_or_none()
    return entry is not None


def _record_reducer_failure(
    db: Session,
    tenant_id: str,
    entity_type: str,
    entity_id: str,
    event_id: str,
    error: str,
) -> None:
    """Upsert a quarantine entry, incrementing failure_count."""
    entry = db.execute(
        select(QuarantineEntry).where(
            QuarantineEntry.tenant_id == tenant_id,
            QuarantineEntry.entity_type == entity_type,
            QuarantineEntry.entity_id == entity_id,
        )
    ).scalar_one_or_none()

    now = datetime.now(timezone.utc)
    if entry is None:
        entry = QuarantineEntry(
            id=str(uuid.uuid4()),
            tenant_id=tenant_id,
            entity_type=entity_type,
            entity_id=entity_id,
            event_id=event_id,
            failure_count=1,
            last_error=error,
        )
        db.add(entry)
    else:
        entry.failure_count += 1
        entry.last_error = error
        entry.event_id = event_id

    if entry.failure_count >= QUARANTINE_THRESHOLD:
        entry.quarantined_at = now
        logger.warning(
            "Quarantined entity %s/%s/%s after %d failures: %s",
            tenant_id,
            entity_type,
            entity_id,
            entry.failure_count,
            error,
        )
    db.flush()


def _materialize(
    db: Session, event: Event, tenant_id: str
) -> Optional[EntityState]:
    """Apply the reducer for this event and upsert entity_state using optimistic
    concurrency (version-checked UPDATE instead of SELECT FOR UPDATE).

    Returns the entity_state row when state was changed, None otherwise.
    """
    if not has_reducer(event.event_type):
        return None

    if _is_quarantined(db, tenant_id, event.entity_type, event.entity_id):
        logger.warning(
            "Skipping materialization for quarantined entity %s/%s/%s",
            tenant_id,
            event.entity_type,
            event.entity_id,
        )
        return None

    reducer = get_reducer(event.event_type)

    for attempt in range(MAX_MATERIALIZE_RETRIES):
        if attempt > 0:
            time.sleep(0.05 * 2**attempt)
            db.expire_all()

        row = db.execute(
            select(EntityState).where(
                EntityState.tenant_id == tenant_id,
                EntityState.entity_type == event.entity_type,
                EntityState.entity_id == event.entity_id,
            )
        ).scalar_one_or_none()

        old_state = row.state if row is not None else {}

        try:
            new_state = run_reducer_safely(reducer, old_state, event)
        except (ReducerError, ReducerTimeoutError) as exc:
            _record_reducer_failure(
                db,
                tenant_id,
                event.entity_type,
                event.entity_id,
                event.event_id,
                str(exc),
            )
            return None

        try:
            new_state = validate_reducer_output(new_state)
        except ReducerOutputInvalid as exc:
            _record_reducer_failure(
                db,
                tenant_id,
                event.entity_type,
                event.entity_id,
                event.event_id,
                str(exc),
            )
            return None

        new_hash = canonical_state_hash(new_state)
        now = datetime.now(timezone.utc)

        if row is None:
            new_row = EntityState(
                tenant_id=tenant_id,
                entity_type=event.entity_type,
                entity_id=event.entity_id,
                state=new_state,
                state_version=1,
                last_event_id=event.event_id,
                last_occurred_at=event.occurred_at,
                state_hash=new_hash,
                materialized_at=now,
                provenance_event_ids=[event.event_id],
            )
            try:
                with db.begin_nested():
                    db.add(new_row)
                    db.flush()
                return new_row
            except IntegrityError:
                continue
        else:
            expected_version = row.state_version
            new_provenance = list(row.provenance_event_ids) + [
                event.event_id
            ]
            stmt = (
                sa_update(EntityState)
                .where(
                    EntityState.tenant_id == tenant_id,
                    EntityState.entity_type == event.entity_type,
                    EntityState.entity_id == event.entity_id,
                    EntityState.state_version == expected_version,
                )
                .values(
                    state=new_state,
                    state_version=expected_version + 1,
                    last_event_id=event.event_id,
                    last_occurred_at=event.occurred_at,
                    state_hash=new_hash,
                    materialized_at=now,
                    provenance_event_ids=new_provenance,
                )
                .execution_options(synchronize_session=False)
            )
            result = db.execute(stmt)
            if result.rowcount == 1:
                db.expire(row)
                db.refresh(row)
                return row

    logger.warning(
        "Materialization failed after %d retries for %s/%s/%s",
        MAX_MATERIALIZE_RETRIES,
        tenant_id,
        event.entity_type,
        event.entity_id,
    )
    return None


def _enqueue_deliveries(
    db: Session, entity_state: EntityState, event_type: str, tenant_id: str
) -> None:
    """Create pending deliveries for active subscriptions matching this state change."""
    subs = (
        db.execute(
            select(Subscription).where(
                Subscription.tenant_id == tenant_id,
                Subscription.entity_type == entity_state.entity_type,
                Subscription.status == "active",
            )
        )
        .scalars()
        .all()
    )

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


def insert_event_idempotent(
    db: Session, event_in: EventIn, tenant_id: str
) -> bool:
    """Insert event + materialize state + enqueue deliveries.

    Return True when inserted, False on duplicate.
    """
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
