"""Statis Python SDK."""

from ._models import (
    # E004-E006: existing pre-v0.4.0 errors (kept; some are aliased by LANE 2)
    ActionDeferredError,
    ActionDeniedError,
    ActionEscalatedError,
    ActionTimeoutError,
    Receipt,
    StatisActionDenied,
    StatisActionEscalated,
    StatisError,
    # v0.4.0 error code system (E001-E012, see DX10).
    ActionPending,  # E004 — sync decorator timeout, carries resume_url
    DecorationTimeError,  # E010 — @statis.gate misuse at decoration time
    IdempotencyConflictError,  # E008
    InvalidActionNameError,  # E007
    InvalidAPIKeyError,  # E002
    InvalidMockConfigError,  # E009 — STATIS_BASE_URL=mock:// misconfig
    MissingAPIKeyError,  # E001
    NetworkError,  # E003 — distinct from generic StatisError
    SignatureVerificationError,  # E011 — receipt tampering or wrong pubkey
    StatisDeprecationError,  # E012 — v0.1.x import path used
)
from ._idempotency import kwargs_only
from .client import StatisClient
from .decorator import gate

# Re-export statis-kit context processing (offline, zero-auth)
from statis_kit import (
    CompressorConfig,
    GuardConfig,
    GuardHaltError,
    KitConfig,
    MeterConfig,
    ProcessedContext,
)
from statis_kit import process as process_context

__all__ = [
    # v0.4.0 primary surface
    "gate",
    "kwargs_only",
    "StatisClient",
    "Receipt",
    # Errors — pre-v0.4.0 (kept)
    "StatisError",
    "ActionDeniedError",
    "ActionEscalatedError",
    "ActionDeferredError",
    "ActionTimeoutError",
    "StatisActionDenied",
    "StatisActionEscalated",
    # Errors — v0.4.0 stable code system (E001-E012)
    "ActionPending",
    "DecorationTimeError",
    "IdempotencyConflictError",
    "InvalidActionNameError",
    "InvalidAPIKeyError",
    "InvalidMockConfigError",
    "MissingAPIKeyError",
    "NetworkError",
    "SignatureVerificationError",
    "StatisDeprecationError",
    # statis-kit re-exports
    "process_context",
    "KitConfig",
    "CompressorConfig",
    "MeterConfig",
    "GuardConfig",
    "GuardHaltError",
    "ProcessedContext",
]
