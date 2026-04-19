from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class ContextLogEntryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    entry_id: str
    action_id: str
    sequence: int
    field_key: str
    classification: str
    content_hash: str
    previous_hash: Optional[str]
    chain_hash: str
    created_at: datetime


class ContextLogVerifyOut(BaseModel):
    action_id: str
    sequence_count: int
    chain_valid: bool
    entries: list[ContextLogEntryOut]
