import concurrent.futures
import logging
from datetime import datetime, timedelta, timezone
from typing import Optional

import httpx
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.delivery import Delivery
from app.models.entity_state import EntityState
from app.models.subscription import Subscription

logger = logging.getLogger(__name__)

MAX_ATTEMPTS = 5
BASE_DELAY_SECONDS = 2


def fetch_pending(db: Session, batch_size: int = 10):
    """Return up to batch_size pending/failed deliveries ready for attempt."""
    stmt = (
        select(Delivery)
        .where(
            Delivery.status.in_(["pending", "failed"]),
            Delivery.next_attempt_at <= datetime.now(timezone.utc),
        )
        .order_by(Delivery.next_attempt_at)
        .limit(batch_size)
        .with_for_update(skip_locked=True)
    )
    return db.execute(stmt).scalars().all()


def _build_payload(
    delivery: Delivery,
    state: dict,
    state_hash: str,
) -> dict:
    return {
        "subscription_id": delivery.subscription_id,
        "tenant_id": delivery.tenant_id,
        "entity_type": delivery.entity_type,
        "entity_id": delivery.entity_id,
        "state_version": delivery.state_version,
        "state": state,
        "state_hash": state_hash,
        "delivered_at": datetime.now(timezone.utc).isoformat(),
    }


def _send_webhook(
    http_client: httpx.Client,
    destination: str,
    payload: dict,
) -> tuple[Optional[int], Optional[str]]:
    """Fire the HTTP request. Returns (status_code, error_string)."""
    try:
        resp = http_client.post(destination, json=payload)
        if 200 <= resp.status_code < 300:
            return resp.status_code, None
        return resp.status_code, f"HTTP {resp.status_code}"
    except Exception as exc:
        return None, str(exc)


def process_delivery(
    db: Session,
    delivery: Delivery,
    http_client: Optional[httpx.Client] = None,
) -> None:
    """Attempt to deliver a single webhook. Updates the row in place (caller commits)."""
    sub = db.get(Subscription, delivery.subscription_id)
    if sub is None or sub.status != "active":
        delivery.status = "dead"
        delivery.last_error = "subscription missing or paused"
        return

    entity_state = db.execute(
        select(EntityState).where(
            EntityState.tenant_id == delivery.tenant_id,
            EntityState.entity_type == delivery.entity_type,
            EntityState.entity_id == delivery.entity_id,
        )
    ).scalar_one_or_none()

    if entity_state is None:
        delivery.status = "dead"
        delivery.last_error = "entity state not found"
        return

    payload = _build_payload(
        delivery, entity_state.state, entity_state.state_hash
    )

    client = http_client or httpx.Client(timeout=10)
    should_close = http_client is None

    try:
        resp = client.post(sub.destination, json=payload)
        delivery.response_code = resp.status_code

        if 200 <= resp.status_code < 300:
            delivery.status = "sent"
            delivery.sent_at = datetime.now(timezone.utc)
            logger.info(
                "Delivered %s (tenant %s) -> %s (HTTP %d)",
                delivery.delivery_id,
                delivery.tenant_id,
                sub.destination,
                resp.status_code,
            )
        else:
            _handle_failure(delivery, f"HTTP {resp.status_code}")
    except Exception as exc:
        _handle_failure(delivery, str(exc))
    finally:
        if should_close:
            client.close()


def process_batch(
    db: Session,
    deliveries: list[Delivery],
    http_client: Optional[httpx.Client] = None,
) -> None:
    """Process a batch of deliveries with concurrent webhook delivery.

    Phase 1: prepare payloads single-threaded (reads from DB session).
    Phase 2: fire webhooks concurrently via ThreadPoolExecutor.
    Phase 3: apply results back to delivery rows single-threaded.
    """
    prepared: list[tuple[Delivery, Subscription, dict]] = []
    for delivery in deliveries:
        sub = db.get(Subscription, delivery.subscription_id)
        if sub is None or sub.status != "active":
            delivery.status = "dead"
            delivery.last_error = "subscription missing or paused"
            continue

        entity_state = db.execute(
            select(EntityState).where(
                EntityState.tenant_id == delivery.tenant_id,
                EntityState.entity_type == delivery.entity_type,
                EntityState.entity_id == delivery.entity_id,
            )
        ).scalar_one_or_none()

        if entity_state is None:
            delivery.status = "dead"
            delivery.last_error = "entity state not found"
            continue

        payload = _build_payload(
            delivery, entity_state.state, entity_state.state_hash
        )
        prepared.append((delivery, sub, payload))

    if not prepared:
        return

    client = http_client or httpx.Client(timeout=10)
    should_close = http_client is None

    try:
        with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
            future_map: dict[concurrent.futures.Future, tuple[Delivery, Subscription]] = {}
            for delivery, sub, payload in prepared:
                future = executor.submit(
                    _send_webhook, client, sub.destination, payload
                )
                future_map[future] = (delivery, sub)

            for future in concurrent.futures.as_completed(future_map):
                delivery, sub = future_map[future]
                status_code, error = future.result()

                if error is None:
                    delivery.response_code = status_code
                    delivery.status = "sent"
                    delivery.sent_at = datetime.now(timezone.utc)
                    logger.info(
                        "Delivered %s (tenant %s) -> %s (HTTP %d)",
                        delivery.delivery_id,
                        delivery.tenant_id,
                        sub.destination,
                        status_code,
                    )
                else:
                    if status_code is not None:
                        delivery.response_code = status_code
                    _handle_failure(delivery, error)
    finally:
        if should_close:
            client.close()


def _handle_failure(delivery: Delivery, error: str) -> None:
    delivery.attempt_count += 1
    delivery.last_error = error

    if delivery.attempt_count >= MAX_ATTEMPTS:
        delivery.status = "dead"
        logger.warning(
            "Delivery %s dead after %d attempts: %s",
            delivery.delivery_id,
            delivery.attempt_count,
            error,
        )
    else:
        delivery.status = "failed"
        backoff = timedelta(seconds=BASE_DELAY_SECONDS ** delivery.attempt_count)
        delivery.next_attempt_at = datetime.now(timezone.utc) + backoff
        logger.info(
            "Delivery %s failed (attempt %d), retry at %s: %s",
            delivery.delivery_id,
            delivery.attempt_count,
            delivery.next_attempt_at,
            error,
        )
