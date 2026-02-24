from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class DeliveryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    delivery_id: str
    subscription_id: str
    entity_type: str
    entity_id: str
    state_version: int
    dedupe_key: str
    status: str
    attempt_count: int
    next_attempt_at: datetime
    last_error: Optional[str] = None
    sent_at: Optional[datetime] = None
    response_code: Optional[int] = None
    created_at: datetime
