from typing import List

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import AuthContext, get_auth_context
from app.db.session import get_db
from app.models.delivery import Delivery
from app.schemas.deliveries import DeliveryOut

router = APIRouter(tags=["deliveries"])


@router.get("/deliveries", response_model=List[DeliveryOut])
def list_deliveries(
    entity_type: str = Query(...),
    entity_id: str = Query(...),
    limit: int = Query(default=50, ge=1, le=200),
    db: Session = Depends(get_db),
    auth: AuthContext = Depends(get_auth_context),
) -> List[DeliveryOut]:
    rows = (
        db.execute(
            select(Delivery)
            .where(
                Delivery.tenant_id == auth.tenant_id,
                Delivery.entity_type == entity_type,
                Delivery.entity_id == entity_id,
            )
            .order_by(Delivery.created_at.desc())
            .limit(limit)
        )
        .scalars()
        .all()
    )
    return [DeliveryOut.model_validate(r) for r in rows]


@router.get(
    "/delivery-trace/{subscription_id}", response_model=List[DeliveryOut]
)
def delivery_trace(
    subscription_id: str,
    limit: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
    auth: AuthContext = Depends(get_auth_context),
) -> List[DeliveryOut]:
    rows = (
        db.execute(
            select(Delivery)
            .where(
                Delivery.tenant_id == auth.tenant_id,
                Delivery.subscription_id == subscription_id,
            )
            .order_by(Delivery.created_at.desc())
            .limit(limit)
        )
        .scalars()
        .all()
    )
    return [DeliveryOut.model_validate(r) for r in rows]
