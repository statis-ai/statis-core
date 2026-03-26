"""Generic adapter — log-only, returns success with logged parameters.

Used for action types that do not integrate with an external system but still
need to flow through the Statis execution pipeline for audit and policy
enforcement purposes (e.g. log_expense, propose_trade, update_budget,
log_tax_entry).
"""
from __future__ import annotations

import logging
from typing import Any

from app.adapters.base import BaseAdapter, ExecutionResult

logger = logging.getLogger(__name__)


class GenericAdapter(BaseAdapter):
    """Log-only adapter.

    Accepts any action type. Records the action_id, action_type, and
    parameters to the application log and returns a successful result
    containing those same values. No external system is called.

    Idempotency: always returns success — re-executing the same action_id
    produces the same (log-only) outcome.
    """

    def execute(self, action: Any) -> ExecutionResult:
        action_id: str = (
            action.action_id if hasattr(action, "action_id") else action["action_id"]
        )
        action_type: str = (
            action.action_type
            if hasattr(action, "action_type")
            else action["action_type"]
        )
        parameters: dict = (
            action.parameters
            if hasattr(action, "parameters")
            else action.get("parameters", {})
        )

        logger.info(
            "GenericAdapter: action_id=%s action_type=%s parameters=%s",
            action_id,
            action_type,
            parameters,
        )

        return ExecutionResult(
            success=True,
            result={
                "action_id": action_id,
                "action_type": action_type,
                "parameters": parameters,
                "adapter": "generic",
                "status": "logged",
            },
        )
