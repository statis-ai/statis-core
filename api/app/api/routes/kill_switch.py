from datetime import datetime, timezone

from fastapi import APIRouter, Depends, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.api.deps import AuthContext, get_auth_context
from app.db.session import get_db
from app.models.kill_switch import KillSwitch

router = APIRouter(prefix="/kill-switch", tags=["kill-switch"])


class KillSwitchStatus(BaseModel):
    active: bool
    activated_at: datetime | None = None


@router.post("/activate", response_model=KillSwitchStatus, status_code=status.HTTP_200_OK)
def activate(db: Session = Depends(get_db), auth: AuthContext = Depends(get_auth_context)):
    ks = db.query(KillSwitch).filter(KillSwitch.tenant_id == auth.tenant_id).first()
    now = datetime.now(timezone.utc)
    if ks is None:
        ks = KillSwitch(
            tenant_id=auth.tenant_id,
            active=True,
            activated_at=now,
            activated_by=None,
        )
        db.add(ks)
    else:
        ks.active = True
        ks.activated_at = now
    db.commit()
    return KillSwitchStatus(active=True, activated_at=now)


@router.post("/deactivate", response_model=KillSwitchStatus, status_code=status.HTTP_200_OK)
def deactivate(db: Session = Depends(get_db), auth: AuthContext = Depends(get_auth_context)):
    ks = db.query(KillSwitch).filter(KillSwitch.tenant_id == auth.tenant_id).first()
    if ks:
        ks.active = False
        db.commit()
    return KillSwitchStatus(active=False, activated_at=None)


@router.get("/status", response_model=KillSwitchStatus)
def get_status(db: Session = Depends(get_db), auth: AuthContext = Depends(get_auth_context)):
    ks = db.query(KillSwitch).filter(KillSwitch.tenant_id == auth.tenant_id).first()
    if ks is None or not ks.active:
        return KillSwitchStatus(active=False)
    return KillSwitchStatus(active=True, activated_at=ks.activated_at)
