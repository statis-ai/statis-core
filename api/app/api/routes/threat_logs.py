from datetime import datetime

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.api.deps import AuthContext, get_auth_context
from app.db.session import get_db
from app.models.threat_log import ThreatLog

router = APIRouter(tags=["threat-logs"])


class ThreatLogOut(BaseModel):
    id: str
    action_id: str
    tenant_id: str
    threat_types: list[str]
    threat_level: str
    details: str | None
    scanned_at: datetime

    model_config = {"from_attributes": True}


@router.get("/threat-logs", response_model=list[ThreatLogOut])
def list_threat_logs(
    limit: int = Query(default=100, le=500),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    auth: AuthContext = Depends(get_auth_context),
) -> list[ThreatLogOut]:
    logs = (
        db.query(ThreatLog)
        .filter(ThreatLog.tenant_id == auth.tenant_id)
        .order_by(ThreatLog.scanned_at.desc())
        .limit(limit)
        .offset(offset)
        .all()
    )
    return [ThreatLogOut.model_validate(log) for log in logs]
