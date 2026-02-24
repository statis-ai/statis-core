from datetime import datetime
from typing import Any
from typing import Optional

from pydantic import BaseModel, ConfigDict


class EventIn(BaseModel):
    event_id: str
    entity_type: str
    entity_id: str
    event_type: str
    payload: dict[str, Any]
    occurred_at: datetime
    producer: str
    schema_version: str
    trace_id: Optional[str] = None


class EventAccepted(BaseModel):
    accepted: bool = True
    event_id: str


class EventOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    event_id: str
    entity_type: str
    entity_id: str
    event_type: str
    payload: dict[str, Any]
    occurred_at: datetime
    ingested_at: datetime
    producer: str
    schema_version: str
    trace_id: Optional[str] = None
