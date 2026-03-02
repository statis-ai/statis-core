from pydantic import BaseModel


class EvaluateResponse(BaseModel):
    action_id: str
    receipt_id: str
    decision: str
    rule_id: str | None
    rule_version: str | None
    reason: str
