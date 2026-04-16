"""statis-kit — Offline context processing for LLM message arrays."""
from __future__ import annotations

from typing import Any, Optional

from ._types import (
    CompressorConfig,
    CostEstimate,
    GuardConfig,
    GuardDetection,
    KitConfig,
    MeterConfig,
    Message,
    ProcessedContext,
    Report,
    TurnCost,
    messages_from_dicts,
    messages_to_dicts,
)
from .compressor import Compressor
from .cost_meter import CostMeter
from .guard import Guard, GuardHaltError, GuardResult

__all__ = [
    "process",
    "KitConfig",
    "CompressorConfig",
    "MeterConfig",
    "GuardConfig",
    "ProcessedContext",
    "Report",
    "Message",
    "CostEstimate",
    "TurnCost",
    "GuardDetection",
    "GuardHaltError",
    "GuardResult",
    "Guard",
    "CostMeter",
    "Compressor",
]


def process(
    messages: list[dict[str, Any]],
    config: Optional[KitConfig] = None,
) -> ProcessedContext:
    """Unified entry point. Runs guard -> compressor -> meter in sequence.

    Accepts raw message dicts (OpenAI format) for convenience.
    """
    cfg = config or KitConfig()
    msgs = messages_from_dicts(messages)

    guard_detections: list[GuardDetection] = []
    stripped_payloads: list[int] = []

    # --- Phase 1: Guard ---
    if cfg.guard is not None or cfg.guard is None:
        # Guard runs by default unless explicitly disabled by passing no config
        # and no messages — we always guard
        guard = Guard(cfg.guard)
        guard_result = guard.scan(msgs)
        guard_detections = guard_result.detections
        stripped_payloads = [d.turn_index for d in guard_detections]
        msgs = guard_result.messages

    # --- Phase 2: Compressor ---
    compressed_ranges: list[tuple[int, int]] = []
    if cfg.compressor is not None:
        compressor = Compressor(cfg.compressor, cfg.summarizer)
        msgs, compressed_ranges = compressor.process(msgs)

    # --- Phase 3: Cost Meter ---
    meter = CostMeter(cfg.meter)
    original_tokens = sum(
        meter.count_tokens(m.get("content", "")) for m in messages
    )
    processed_tokens, per_turn_costs = meter.count_messages(msgs)
    cost_estimate = meter.estimate_cost(processed_tokens)

    return ProcessedContext(
        messages=messages_to_dicts(msgs),
        report=Report(
            original_tokens=original_tokens,
            processed_tokens=processed_tokens,
            token_delta=original_tokens - processed_tokens,
            cost_estimate=cost_estimate,
            per_turn_costs=per_turn_costs,
            guard_detections=guard_detections,
            compressed_ranges=compressed_ranges,
            stripped_payloads=list(set(stripped_payloads)),
        ),
    )
