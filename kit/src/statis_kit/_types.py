from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Callable, Optional


# ---------------------------------------------------------------------------
# Message
# ---------------------------------------------------------------------------

@dataclass
class Message:
    role: str
    content: str
    name: Optional[str] = None
    tool_call_id: Optional[str] = None
    metadata: Optional[dict[str, Any]] = None


def messages_from_dicts(raw: list[dict[str, Any]]) -> list[Message]:
    """Convert a list of OpenAI-format dicts to Message dataclasses."""
    out: list[Message] = []
    for d in raw:
        out.append(Message(
            role=d["role"],
            content=d.get("content", ""),
            name=d.get("name"),
            tool_call_id=d.get("tool_call_id"),
            metadata=d.get("metadata"),
        ))
    return out


def messages_to_dicts(msgs: list[Message]) -> list[dict[str, Any]]:
    """Convert Message dataclasses back to OpenAI-format dicts."""
    out: list[dict[str, Any]] = []
    for m in msgs:
        d: dict[str, Any] = {"role": m.role, "content": m.content}
        if m.name is not None:
            d["name"] = m.name
        if m.tool_call_id is not None:
            d["tool_call_id"] = m.tool_call_id
        if m.metadata is not None:
            d["metadata"] = m.metadata
        out.append(d)
    return out


# ---------------------------------------------------------------------------
# Classification
# ---------------------------------------------------------------------------

class Bucket(str, Enum):
    PINNED = "pinned"
    RECENT = "recent"
    COMPRESSIBLE = "compressible"
    PRUNABLE = "prunable"


@dataclass
class ClassifiedMessage:
    message: Message
    index: int
    bucket: Bucket


# ---------------------------------------------------------------------------
# Cost / metering
# ---------------------------------------------------------------------------

@dataclass
class CostEstimate:
    input_cost_usd: float
    output_cost_usd: float
    total_cost_usd: float
    model: str


@dataclass
class TurnCost:
    turn_index: int
    role: str
    tokens: int
    cost_usd: float


# ---------------------------------------------------------------------------
# Guard
# ---------------------------------------------------------------------------

@dataclass
class GuardDetection:
    turn_index: int
    pattern_id: str
    category: str
    matched_text: str
    action_taken: str


# ---------------------------------------------------------------------------
# Report + ProcessedContext  (top-level output)
# ---------------------------------------------------------------------------

@dataclass
class Report:
    original_tokens: int
    processed_tokens: int
    token_delta: int
    cost_estimate: Optional[CostEstimate]
    per_turn_costs: list[TurnCost] = field(default_factory=list)
    guard_detections: list[GuardDetection] = field(default_factory=list)
    compressed_ranges: list[tuple[int, int]] = field(default_factory=list)
    stripped_payloads: list[int] = field(default_factory=list)


@dataclass
class ProcessedContext:
    messages: list[dict[str, Any]]
    report: Report


# ---------------------------------------------------------------------------
# Configs
# ---------------------------------------------------------------------------

@dataclass
class CompressorConfig:
    pin_top: int = 1
    recent_turns: int = 4
    summary_max_tokens: int = 200
    prune_older_than_turns: int = 20
    prune_if_superseded: bool = True


@dataclass
class MeterConfig:
    model: str = "gpt-4o"
    pricing_path: Optional[str] = None
    on_turn: Optional[Callable[[TurnCost], None]] = None


@dataclass
class GuardConfig:
    on_detect: str = "strip"  # "strip" | "halt"
    extra_patterns: Optional[list[dict[str, Any]]] = None
    disabled_categories: Optional[list[str]] = None


SummarizerFn = Callable[[str], str]


@dataclass
class KitConfig:
    compressor: Optional[CompressorConfig] = None
    meter: Optional[MeterConfig] = None
    guard: Optional[GuardConfig] = None
    summarizer: Optional[SummarizerFn] = None
