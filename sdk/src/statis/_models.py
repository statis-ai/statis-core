from dataclasses import dataclass
from datetime import datetime
from typing import Any, Optional


@dataclass
class SimulateResult:
    decision: str
    rule_id: Optional[str]
    rule_version: Optional[str]
    reason: str


@dataclass
class Receipt:
    receipt_id: str
    action_id: str
    decision: str
    rule_id: Optional[str]
    rule_version: Optional[str]
    approved_by: str
    conditions_evaluated: Optional[dict[str, Any]]
    execution_result: Optional[dict[str, Any]]
    executed_at: Optional[datetime]
    hash: str
    created_at: datetime
    # AARM R5 — Ed25519 signature fields. None on legacy receipts that
    # predate PR-AARM-02, populated on everything signed after that.
    signature: Optional[str] = None
    signature_alg: Optional[str] = None
    public_key_id: Optional[str] = None


class StatisError(Exception):
    """Raised when the Statis API returns a non-2xx response."""

    def __init__(self, status_code: int, message: str) -> None:
        super().__init__(f"HTTP {status_code}: {message}")
        self.status_code = status_code
        self.message = message


class ActionDeniedError(Exception):
    """Raised by execute() when the policy engine denies the action."""

    error_code = "E005"

    def __init__(self, reason: str, receipt: Receipt) -> None:
        super().__init__(reason)
        self.reason = reason
        self.receipt = receipt


class ActionTimeoutError(Exception):
    """Raised by execute() when execution doesn't complete within timeout."""

    def __init__(self, action_id: str, timeout: float) -> None:
        super().__init__(
            f"Action '{action_id}' did not complete within {timeout}s"
        )
        self.action_id = action_id
        self.timeout = timeout


class ActionEscalatedError(Exception):
    """Raised by execute() when the policy engine escalates the action for human review.

    The agent should surface this to its operator and stop waiting — a human
    must approve or reject via the Statis Console (or API) before execution proceeds.
    """

    def __init__(self, action_id: str) -> None:
        super().__init__(
            f"Action '{action_id}' was escalated and requires human review"
        )
        self.action_id = action_id


class StatisActionDenied(Exception):
    """Raised by wait_for_completion() when a policy rule denies the action.

    Carries the action_id, the matched rule_id (if available), and a human-readable reason.
    """

    def __init__(self, action_id: str, rule_id: Optional[str] = None, reason: str = "") -> None:
        super().__init__(f"Action '{action_id}' denied by rule '{rule_id}': {reason}")
        self.action_id = action_id
        self.rule_id = rule_id
        self.reason = reason


class StatisActionEscalated(Exception):
    """Raised by wait_for_completion() when the action is escalated for human review.

    Carries the action_id and optional escalation_id.
    """

    def __init__(self, action_id: str, escalation_id: Optional[str] = None) -> None:
        super().__init__(
            f"Action '{action_id}' escalated (escalation_id={escalation_id})"
        )
        self.action_id = action_id
        self.escalation_id = escalation_id


class ActionDeferredError(Exception):
    """Raised when the policy engine defers an action (AARM R4 DEFER).

    A deferred action is not yet decided — the engine suspended execution
    because available context was insufficient, ambiguous, or conflicting.
    The action will resolve (allow/deny) once additional context arrives,
    a timeout triggers, or a human resolves it via the Console.

    In PR-AARM-01 this is surfaced to SDK callers as a distinct error so
    agents can handle DEFER differently from DENY/STEP_UP. Full resolution
    workflow (polling a deferred action until resolution) lands in
    PR-AARM-05.
    """

    error_code = "E006"

    def __init__(self, action_id: str, reason: Optional[str] = None) -> None:
        super().__init__(
            f"Action '{action_id}' was deferred: {reason or 'awaiting resolution'}"
        )
        self.action_id = action_id
        self.reason = reason


# ---------------------------------------------------------------------------
# v0.4.0 error code system (DX10).
#
# Every Statis exception carries a stable `error_code` (E001-E012). Errors
# include a `doc_url` property pointing to https://statis.dev/errors/{code},
# so devs grepping logs for "E007" find the doc page directly.
# Full list + Mintlify pages land in Week 2 with the docs rewrite.
# ---------------------------------------------------------------------------

_ERRORS_BASE_URL = "https://statis.dev/errors"


def _doc_url(code: str) -> str:
    return f"{_ERRORS_BASE_URL}/{code}"


class MissingAPIKeyError(Exception):
    """E001 — STATIS_API_KEY env var not set and no api_key was passed."""

    error_code = "E001"

    def __init__(self) -> None:
        super().__init__(
            "STATIS_API_KEY is not set. "
            "Run `statis init` to register a tenant, or export STATIS_API_KEY=... "
            f"See {_doc_url('E001')}"
        )
        self.doc_url = _doc_url("E001")


class InvalidAPIKeyError(Exception):
    """E002 — API rejected the key (bad format or revoked)."""

    error_code = "E002"

    def __init__(self, hint: Optional[str] = None) -> None:
        super().__init__(
            "Statis API rejected your API key. "
            "Check ~/.statis/config.toml or rerun `statis init`. "
            + (f"Server hint: {hint}. " if hint else "")
            + f"See {_doc_url('E002')}"
        )
        self.doc_url = _doc_url("E002")


class NetworkError(Exception):
    """E003 — Statis API unreachable after retries.

    Distinct from generic StatisError (which is a non-2xx response from a
    reachable server). NetworkError fires when the server can't be contacted.
    """

    error_code = "E003"

    def __init__(self, base_url: str, attempts: int, last_error: str) -> None:
        super().__init__(
            f"Could not reach Statis API at {base_url}. "
            f"Tried {attempts} times. Last error: {last_error}. "
            "To proceed without governance, set on_error=\"fail_open\" or STATIS_DISABLED=1. "
            f"See {_doc_url('E003')}"
        )
        self.base_url = base_url
        self.attempts = attempts
        self.last_error = last_error
        self.doc_url = _doc_url("E003")


class ActionPending(Exception):
    """E004 — sync decorator timeout exceeded; action still awaits human decision.

    The approval URL remains valid until URL TTL. Resume by re-running the agent
    with the same idempotency_key (which dedups to the existing action_id).

    Note: this is BOTH the timeout exception AND the pending-state object that
    callers can introspect. Replaces ActionTimeoutError for the v0.4.0 decorator
    surface. ActionTimeoutError stays for back-compat with statis.advanced clients.
    """

    error_code = "E004"

    def __init__(self, action_id: str, resume_url: str, expires_at: Optional[datetime] = None) -> None:
        super().__init__(
            f"Action '{action_id}' is pending human approval. "
            f"Resume at: {resume_url}. "
            f"See {_doc_url('E004')}"
        )
        self.action_id = action_id
        self.resume_url = resume_url
        self.expires_at = expires_at
        self.doc_url = _doc_url("E004")


class InvalidActionNameError(Exception):
    """E007 — action_name is not registered and auto-create is disabled."""

    error_code = "E007"

    def __init__(self, action_name: str) -> None:
        super().__init__(
            f"action_name '{action_name}' is not registered for this tenant. "
            "Register it via `statis policy apply`, or pass auto_register=True. "
            f"See {_doc_url('E007')}"
        )
        self.action_name = action_name
        self.doc_url = _doc_url("E007")


class IdempotencyConflictError(Exception):
    """E008 — same idempotency_key was used with different args."""

    error_code = "E008"

    def __init__(self, idempotency_key: str, existing_action_id: str) -> None:
        super().__init__(
            f"Idempotency conflict: key '{idempotency_key}' was already used "
            f"for action '{existing_action_id}' with different arguments. "
            "Use a unique key per logical action, or delete the old action_id. "
            f"See {_doc_url('E008')}"
        )
        self.idempotency_key = idempotency_key
        self.existing_action_id = existing_action_id
        self.doc_url = _doc_url("E008")


class InvalidMockConfigError(Exception):
    """E009 — STATIS_BASE_URL=mock:// configured with an invalid pattern."""

    error_code = "E009"

    def __init__(self, config: str, problem: str) -> None:
        super().__init__(
            f"Invalid mock:// config: {problem} (got: {config!r}). "
            f"See {_doc_url('E009')} for valid mock:// URI patterns."
        )
        self.config = config
        self.problem = problem
        self.doc_url = _doc_url("E009")


class DecorationTimeError(Exception):
    """E010 — @statis.gate applied to an unsupported target.

    Generators, async generators, and context managers are not supported in
    v0.4.0. The error fires at decoration time (import time), not call time —
    so misuse fails loud + early instead of after the agent is in production.
    """

    error_code = "E010"

    def __init__(self, target: str, reason: str) -> None:
        super().__init__(
            f"@statis.gate cannot wrap '{target}': {reason}. "
            f"See {_doc_url('E010')}"
        )
        self.target = target
        self.reason = reason
        self.doc_url = _doc_url("E010")


class SignatureVerificationError(Exception):
    """E011 — receipt's Ed25519 signature failed verification.

    Trust-destroying event. Either the receipt was tampered, OR the verifier
    has the wrong public key. Both paths end at security@statis.dev.
    """

    error_code = "E011"

    def __init__(self, receipt_id: str, check: str) -> None:
        super().__init__(
            f"Signature verification failed for receipt '{receipt_id}': {check}. "
            "Receipt may be tampered. Report to security@statis.dev. "
            f"See {_doc_url('E011')}"
        )
        self.receipt_id = receipt_id
        self.check = check
        self.doc_url = _doc_url("E011")


class StatisDeprecationError(ImportError):
    """E012 — code uses a v0.1.x import path that moved to statis.advanced.

    Subclasses ImportError so existing `try: from statis import StatisClient
    except ImportError` style code can catch it and fall back gracefully.
    """

    error_code = "E012"

    def __init__(self, old_path: str, new_path: str) -> None:
        super().__init__(
            f"`{old_path}` was moved to `{new_path}` in statis-ai v0.4.0. "
            f"Update your import. Migration guide: https://statis.dev/migrate/0.1-to-0.4 "
            f"See {_doc_url('E012')}"
        )
        self.old_path = old_path
        self.new_path = new_path
        self.doc_url = _doc_url("E012")
