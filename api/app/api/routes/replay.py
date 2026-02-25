import uuid
from typing import Set

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.orm import Session

from app.api.deps import AuthContext, get_auth_context
from app.db.session import get_db
from app.models.delivery import Delivery
from app.models.entity_state import EntityState
from app.models.subscription import Subscription
from app.schemas.replay import ReplayRequest, ReplayResult

router = APIRouter(tags=["replay"])


@router.post("/replay", response_model=ReplayResult)
def replay(
    body: ReplayRequest,
    db: Session = Depends(get_db),
    auth: AuthContext = Depends(get_auth_context),
) -> ReplayResult:
    tenant_id = auth.tenant_id

    sub = db.get(Subscription, body.subscription_id)
    if sub is None or sub.tenant_id != tenant_id:
        raise HTTPException(status_code=404, detail="Subscription not found")
    if sub.status != "active":
        raise HTTPException(status_code=409, detail="Subscription is not active")

    es_stmt = select(EntityState).where(EntityState.tenant_id == tenant_id)
    if body.entity_type is not None:
        es_stmt = es_stmt.where(EntityState.entity_type == body.entity_type)
    if body.entity_id is not None:
        es_stmt = es_stmt.where(EntityState.entity_id == body.entity_id)

    entity_states = db.execute(es_stmt).scalars().all()

    candidates = []
    for es in entity_states:
        from_rev = max(body.from_rev or 1, 1)
        to_rev = min(body.to_rev or es.state_version, es.state_version)

        for version in range(from_rev, to_rev + 1):
            dedupe_key = (
                f"{tenant_id}:{sub.subscription_id}:{es.entity_type}"
                f":{es.entity_id}:{version}"
            )
            candidates.append((es, version, dedupe_key))

    if not candidates:
        return ReplayResult(enqueued=0, skipped=0)

    all_keys = [c[2] for c in candidates]
    existing_keys: Set[str] = set(
        db.execute(
            select(Delivery.dedupe_key).where(Delivery.dedupe_key.in_(all_keys))
        )
        .scalars()
        .all()
    )

    enqueued = 0
    skipped = 0

    for es, version, dedupe_key in candidates:
        if dedupe_key in existing_keys:
            skipped += 1
            continue

        stmt = (
            pg_insert(Delivery)
            .values(
                delivery_id=str(uuid.uuid4()),
                tenant_id=tenant_id,
                subscription_id=sub.subscription_id,
                entity_type=es.entity_type,
                entity_id=es.entity_id,
                state_version=version,
                dedupe_key=dedupe_key,
                status="pending",
                attempt_count=0,
            )
            .on_conflict_do_nothing(index_elements=["dedupe_key"])
        )
        db.execute(stmt)
        enqueued += 1

    db.commit()
    return ReplayResult(enqueued=enqueued, skipped=skipped)
