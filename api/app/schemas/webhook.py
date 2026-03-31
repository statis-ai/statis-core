from datetime import datetime

from pydantic import BaseModel, HttpUrl, field_validator

VALID_EVENTS = {"action.completed", "action.denied", "action.escalated"}


class WebhookCreate(BaseModel):
    url: HttpUrl
    events: list[str]

    @field_validator("events")
    @classmethod
    def validate_events(cls, v: list[str]) -> list[str]:
        invalid = set(v) - VALID_EVENTS
        if invalid:
            raise ValueError(
                f"Invalid event types: {invalid}. Valid: {VALID_EVENTS}"
            )
        if not v:
            raise ValueError("At least one event type is required")
        return v


class WebhookResponse(BaseModel):
    id: str
    tenant_id: str
    url: str
    events: list[str]
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}
