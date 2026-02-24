from typing import Optional

from pydantic import BaseModel


class ReplayRequest(BaseModel):
    subscription_id: str
    entity_type: Optional[str] = None
    entity_id: Optional[str] = None
    from_rev: Optional[int] = 1
    to_rev: Optional[int] = None


class ReplayResult(BaseModel):
    enqueued: int
    skipped: int
