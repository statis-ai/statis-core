from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class EscalationReviewIn(BaseModel):
    reviewer_id: str
    note: Optional[str] = None


class EscalationReviewOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    review_id: str
    action_id: str
    reviewer_id: str
    reviewer_decision: str
    reviewer_note: Optional[str]
    reviewed_at: datetime


class EscalatedActionOut(BaseModel):
    """Summary row for the escalation queue (admin view, not entity-scoped)."""
    model_config = ConfigDict(from_attributes=True)

    action_id: str
    action_type: str
    target_entity: dict
    target_system: str
    proposed_by: str
    created_at: datetime
    updated_at: datetime
