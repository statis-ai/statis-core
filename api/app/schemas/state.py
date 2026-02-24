from typing import Any, List, Optional

from pydantic import BaseModel


class EntityStateOut(BaseModel):
    entity_type: str
    entity_id: str
    state: dict[str, Any]
    state_version: int
    state_hash: Optional[str]
    last_event_id: Optional[str]
    provenance: List[str]
