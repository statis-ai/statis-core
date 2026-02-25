import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import AuthContext, get_auth_context
from app.db.session import get_db
from app.models.subscription import Subscription
from app.schemas.subscriptions import SubscriptionCreate, SubscriptionOut

router = APIRouter(tags=["subscriptions"])


@router.post("/subscriptions", response_model=SubscriptionOut, status_code=201)
def create_subscription(
    body: SubscriptionCreate,
    db: Session = Depends(get_db),
    auth: AuthContext = Depends(get_auth_context),
) -> SubscriptionOut:
    sub = Subscription(
        subscription_id=str(uuid.uuid4()),
        tenant_id=auth.tenant_id,
        entity_type=body.entity_type,
        event_types=body.event_types,
        destination=body.destination,
        status="active",
    )
    db.add(sub)
    db.commit()
    db.refresh(sub)
    return SubscriptionOut.model_validate(sub)


@router.get("/subscriptions", response_model=List[SubscriptionOut])
def list_subscriptions(
    db: Session = Depends(get_db),
    auth: AuthContext = Depends(get_auth_context),
) -> List[SubscriptionOut]:
    rows = (
        db.execute(
            select(Subscription).where(Subscription.tenant_id == auth.tenant_id)
        )
        .scalars()
        .all()
    )
    return [SubscriptionOut.model_validate(r) for r in rows]


@router.get("/subscriptions/{subscription_id}", response_model=SubscriptionOut)
def get_subscription(
    subscription_id: str,
    db: Session = Depends(get_db),
    auth: AuthContext = Depends(get_auth_context),
) -> SubscriptionOut:
    sub = db.get(Subscription, subscription_id)
    if sub is None or sub.tenant_id != auth.tenant_id:
        raise HTTPException(status_code=404, detail="Subscription not found")
    return SubscriptionOut.model_validate(sub)


@router.post(
    "/subscriptions/{subscription_id}/pause", response_model=SubscriptionOut
)
def pause_subscription(
    subscription_id: str,
    db: Session = Depends(get_db),
    auth: AuthContext = Depends(get_auth_context),
) -> SubscriptionOut:
    sub = db.get(Subscription, subscription_id)
    if sub is None or sub.tenant_id != auth.tenant_id:
        raise HTTPException(status_code=404, detail="Subscription not found")
    sub.status = "paused"
    db.commit()
    db.refresh(sub)
    return SubscriptionOut.model_validate(sub)


@router.post(
    "/subscriptions/{subscription_id}/resume", response_model=SubscriptionOut
)
def resume_subscription(
    subscription_id: str,
    db: Session = Depends(get_db),
    auth: AuthContext = Depends(get_auth_context),
) -> SubscriptionOut:
    sub = db.get(Subscription, subscription_id)
    if sub is None or sub.tenant_id != auth.tenant_id:
        raise HTTPException(status_code=404, detail="Subscription not found")
    sub.status = "active"
    db.commit()
    db.refresh(sub)
    return SubscriptionOut.model_validate(sub)
