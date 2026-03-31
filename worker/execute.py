"""Statis execution worker — takes APPROVED actions and executes them exactly once.

Run standalone:
    python -m worker.execute          (from project root)
    python worker/execute.py          (from project root)

Concurrency guard: INSERT INTO execution_locks ON CONFLICT DO NOTHING.
Idempotency guard: skip if receipt.executed_at is already set.
"""

from __future__ import annotations

import logging
import os
import sys
import time
import uuid
from datetime import datetime, timezone
from typing import Any

# Allow importing from the api/ package regardless of cwd
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "api"))

from sqlalchemy import create_engine, delete, select
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.orm import Session, sessionmaker

from app.adapters.airflow import AirflowAdapter
from app.adapters.filesystem import FilesystemAdapter
from app.adapters.generic import GenericAdapter
from app.adapters.hubspot import HubSpotAdapter
from app.adapters.salesforce import SalesforceAdapter
from app.adapters.zendesk import ZendeskAdapter
from app.adapters.base import BaseAdapter
from app.adapters.stripe_mock import MockStripeAdapter
from app.config import settings
from app.models.action_contract import ActionContract
from app.models.escalation_review import EscalationReview
from app.models.execution_lock import ExecutionLock
from app.models.receipt import Receipt

POLL_INTERVAL = float(os.getenv("POLL_INTERVAL", "1"))
BATCH_SIZE = int(os.getenv("BATCH_SIZE", "10"))
WORKER_ID = os.getenv("WORKER_ID", str(uuid.uuid4()))

# Adapter registry: target_system → adapter instance
_generic = GenericAdapter()

ADAPTERS: dict[str, BaseAdapter] = {
    "stripe": MockStripeAdapter(),
    "airflow": AirflowAdapter(),
    "salesforce": SalesforceAdapter(),
    "zendesk": ZendeskAdapter(),
    "hubspot": HubSpotAdapter(),
    "filesystem": FilesystemAdapter(allowed_prefix=os.getenv("FILESYSTEM_ADAPTER_ALLOWED_PREFIX")),
    # Keel action types — log-only via GenericAdapter
    "log_expense": _generic,
    "propose_trade": _generic,
    "update_budget": _generic,
    "log_tax_entry": _generic,
}

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)
logger = logging.getLogger("execute-worker")


def make_session_factory() -> sessionmaker:
    engine = create_engine(settings.database_url, future=True)
    return sessionmaker(bind=engine, autoflush=False, autocommit=False, class_=Session)


def _fetch_approved(db: Session, batch_size: int) -> list[Any]:
    """Return up to batch_size APPROVED action contracts (no row lock — lock is the execution_locks PK)."""
    stmt = (
        select(ActionContract)
        .where(ActionContract.status == "APPROVED")
        .limit(batch_size)
    )
    return db.execute(stmt).scalars().all()


def _already_executed(db: Session, action_id: str) -> bool:
    """True if the receipt for this action already has an executed_at timestamp."""
    row = db.execute(
        select(Receipt).where(
            Receipt.action_id == action_id,
            Receipt.executed_at.isnot(None),
        )
    ).scalar_one_or_none()
    return row is not None


def _try_acquire_lock(db: Session, action_id: str) -> bool:
    """Insert execution lock. Returns True if this worker won the race.

    Uses RETURNING to reliably detect insertion vs. conflict — psycopg3
    does not always report rowcount correctly for INSERT ON CONFLICT DO NOTHING.
    """
    result = db.execute(
        pg_insert(ExecutionLock)
        .values(
            action_id=action_id,
            worker_id=WORKER_ID,
            acquired_at=datetime.now(timezone.utc),
        )
        .on_conflict_do_nothing(index_elements=["action_id"])
        .returning(ExecutionLock.action_id)
    )
    return result.fetchone() is not None


def _release_lock(db: Session, action_id: str) -> None:
    db.execute(delete(ExecutionLock).where(ExecutionLock.action_id == action_id))


def process_action(db: Session, action: ActionContract) -> None:
    """Execute a single APPROVED action.  All DB mutations go through *db*; caller commits."""

    action_id = action.action_id

    # Idempotency: skip if already executed (e.g. worker crash after execute but before commit)
    if _already_executed(db, action_id):
        logger.info("Action %s already executed, skipping", action_id)
        action.status = "COMPLETED"
        return

    # Acquire distributed lock — if another worker beat us, skip silently
    if not _try_acquire_lock(db, action_id):
        logger.debug("Lock for action %s held by another worker, skipping", action_id)
        return

    # Mark EXECUTING atomically with the lock acquisition (already flushed above)
    action.status = "EXECUTING"
    db.commit()

    logger.info("Executing action %s (type=%s, target=%s)", action_id, action.action_type, action.target_system)

    # Resolve adapter
    adapter = ADAPTERS.get(action.target_system)
    if adapter is None:
        _finalize(
            db, action, success=False,
            execution_result={"error": f"No adapter for target_system={action.target_system!r}"},
        )
        return

    # Check if this action was human-approved after escalation — include reviewer in receipt
    review = db.query(EscalationReview).filter(EscalationReview.action_id == action_id).first()

    # Call external system — outside any long-held transaction
    exec_result = adapter.execute(action)

    result_payload = exec_result.result if exec_result.success else {"error": exec_result.error}
    if review is not None:
        result_payload = {
            **result_payload,
            "escalation_review": {
                "review_id": review.review_id,
                "reviewer_id": review.reviewer_id,
                "reviewer_decision": review.reviewer_decision,
                "reviewed_at": review.reviewed_at.isoformat(),
            },
        }
    _finalize(db, action, success=exec_result.success, execution_result=result_payload)


def _finalize(
    db: Session,
    action: ActionContract,
    success: bool,
    execution_result: dict,
) -> None:
    """Write execution outcome to receipt + update action status + release lock, all in one commit."""
    executed_at = datetime.now(timezone.utc)

    db.execute(
        Receipt.__table__.update()
        .where(Receipt.action_id == action.action_id)
        .values(executed_at=executed_at, execution_result=execution_result)
    )
    action.status = "COMPLETED" if success else "FAILED"
    _release_lock(db, action.action_id)
    db.commit()

    logger.info(
        "Action %s → %s | result=%s",
        action.action_id,
        action.status,
        execution_result,
    )


def run_once(session_factory: sessionmaker) -> int:
    """Run one poll cycle. Returns number of actions processed."""
    db = session_factory()
    try:
        actions = _fetch_approved(db, batch_size=BATCH_SIZE)
        if not actions:
            return 0

        for action in actions:
            try:
                process_action(db, action)
            except Exception:
                db.rollback()
                logger.exception("Error processing action %s", action.action_id)

        return len(actions)
    except Exception:
        db.rollback()
        logger.exception("Error in execution poll cycle")
        return 0
    finally:
        db.close()


def main() -> None:
    logger.info(
        "Execution worker starting (worker_id=%s, poll every %.1fs)",
        WORKER_ID,
        POLL_INTERVAL,
    )
    sf = make_session_factory()

    while True:
        processed = run_once(sf)
        if processed:
            logger.info("Processed %d approved actions", processed)
        time.sleep(POLL_INTERVAL)


if __name__ == "__main__":
    main()
