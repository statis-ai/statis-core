import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import AuthContext, get_auth_context
from app.db.session import get_db
from app.models.webhook import Webhook
from app.schemas.webhook import WebhookCreate, WebhookResponse

router = APIRouter(tags=["webhooks"])


@router.post("/webhooks", response_model=WebhookResponse, status_code=status.HTTP_201_CREATED)
def create_webhook(
    body: WebhookCreate,
    db: Session = Depends(get_db),
    auth: AuthContext = Depends(get_auth_context),
) -> WebhookResponse:
    webhook = Webhook(
        id=str(uuid.uuid4()),
        tenant_id=auth.tenant_id,
        url=str(body.url),
        events=body.events,
        is_active=True,
    )
    db.add(webhook)
    db.commit()
    db.refresh(webhook)
    return WebhookResponse.model_validate(webhook)


@router.get("/webhooks", response_model=list[WebhookResponse])
def list_webhooks(
    db: Session = Depends(get_db),
    auth: AuthContext = Depends(get_auth_context),
) -> list[WebhookResponse]:
    webhooks = (
        db.query(Webhook)
        .filter(Webhook.tenant_id == auth.tenant_id, Webhook.is_active.is_(True))
        .order_by(Webhook.created_at.desc())
        .all()
    )
    return [WebhookResponse.model_validate(w) for w in webhooks]


@router.delete("/webhooks/{webhook_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_webhook(
    webhook_id: str,
    db: Session = Depends(get_db),
    auth: AuthContext = Depends(get_auth_context),
) -> None:
    webhook = (
        db.query(Webhook)
        .filter(Webhook.id == webhook_id, Webhook.tenant_id == auth.tenant_id)
        .first()
    )
    if webhook is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Webhook not found")
    db.delete(webhook)
    db.commit()
