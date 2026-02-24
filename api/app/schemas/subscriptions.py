from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict


class SubscriptionCreate(BaseModel):
    entity_type: str
    event_types: Optional[List[str]] = None
    destination: str


class SubscriptionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    subscription_id: str
    entity_type: str
    event_types: Optional[List[str]] = None
    destination: str
    status: str
    created_at: datetime
