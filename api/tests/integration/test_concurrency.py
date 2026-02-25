"""Integration test: 100 concurrent events for the same entity.

Verifies optimistic concurrency control works without deadlocks
and that all events are ingested with a correct final state_version.
"""
import concurrent.futures
import uuid
from datetime import datetime, timezone

from sqlalchemy import select, text
from sqlalchemy.orm import Session

from app.models.entity_state import EntityState
from app.models.event import Event
from app.repositories.events import insert_event_idempotent
from app.schemas.events import EventIn

NUM_CONCURRENT = 100


def _make_event(entity_id: str, seq: int) -> EventIn:
    return EventIn(
        event_id=f"evt_conc_{seq}_{uuid.uuid4().hex[:8]}",
        entity_type="account",
        entity_id=entity_id,
        event_type="support.ticket_updated",
        payload={"ticket_id": f"t_{seq}", "status": "open"},
        occurred_at=datetime.now(timezone.utc),
        producer="concurrency-test",
        schema_version="1",
    )


def test_concurrent_events_no_deadlock(
    migrated_postgres_url: str,
    db_session: Session,
):
    """Post 100 events for the same entity concurrently.

    Asserts:
    - All 100 events are ingested (exist in events table).
    - The final entity_state has state_version == 100.
    - No deadlocks or integrity errors surfaced.
    """
    from sqlalchemy import create_engine
    from sqlalchemy.orm import Session as OrmSession, sessionmaker

    engine = create_engine(migrated_postgres_url, future=True)
    SessionFactory = sessionmaker(
        bind=engine, autoflush=False, autocommit=False, class_=OrmSession
    )

    entity_id = f"acc_conc_{uuid.uuid4().hex[:8]}"
    events = [_make_event(entity_id, i) for i in range(NUM_CONCURRENT)]

    def _post_event(event_in: EventIn) -> bool:
        session = SessionFactory()
        try:
            return insert_event_idempotent(session, event_in, "test_tenant_1")
        except Exception:
            session.rollback()
            return False
        finally:
            session.close()

    with concurrent.futures.ThreadPoolExecutor(max_workers=20) as executor:
        results = list(executor.map(_post_event, events))

    inserted_count = sum(1 for r in results if r is True)
    assert inserted_count == NUM_CONCURRENT, (
        f"Expected {NUM_CONCURRENT} inserts, got {inserted_count}"
    )

    session = SessionFactory()
    try:
        event_count = session.execute(
            select(Event).where(
                Event.entity_id == entity_id,
                Event.tenant_id == "test_tenant_1",
            )
        ).scalars().all()
        assert len(event_count) == NUM_CONCURRENT

        row = session.execute(
            select(EntityState).where(
                EntityState.entity_id == entity_id,
                EntityState.tenant_id == "test_tenant_1",
            )
        ).scalar_one()
        assert row.state_version == NUM_CONCURRENT, (
            f"Expected state_version={NUM_CONCURRENT}, got {row.state_version}"
        )
    finally:
        session.close()
    engine.dispose()
