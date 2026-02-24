import pytest
from sqlalchemy import text
from sqlalchemy.orm import Session


def _event(event_id: str, occurred_at: str) -> dict:
    return {
        "event_id": event_id,
        "entity_type": "account",
        "entity_id": "acc_1",
        "event_type": "ticket.updated",
        "payload": {"ticket_id": "t_1"},
        "occurred_at": occurred_at,
        "producer": "support-agent",
        "schema_version": "1",
    }


@pytest.mark.integration
def test_insert_count_idempotency_and_order(client, db_session: Session) -> None:
    # Insert out of order by occurred_at to validate deterministic ordering.
    events = [
        _event("evt_b", "2026-02-19T10:00:00Z"),
        _event("evt_a", "2026-02-19T10:00:00Z"),
        _event("evt_c", "2026-02-19T09:59:00Z"),
    ]
    statuses = [client.post("/events", json=e).status_code for e in events]
    assert statuses == [201, 201, 201]

    duplicate = client.post("/events", json=events[0])
    assert duplicate.status_code == 200
    assert duplicate.json() == {"accepted": True, "event_id": "evt_b"}

    count = db_session.execute(text("SELECT COUNT(*) FROM events")).scalar_one()
    assert count == 3

    ordered_ids = db_session.execute(
        text(
            """
            SELECT event_id
            FROM events
            ORDER BY occurred_at ASC, ingested_at ASC, event_id ASC
            """
        )
    ).scalars().all()
    assert ordered_ids == ["evt_c", "evt_b", "evt_a"]
