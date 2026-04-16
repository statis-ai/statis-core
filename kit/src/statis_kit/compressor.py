"""Three-pass context compressor: classify -> summarize -> prune."""
from __future__ import annotations

import re
from typing import Callable, Optional

from ._types import Bucket, ClassifiedMessage, CompressorConfig, Message

SummarizerFn = Callable[[str], str]

# Heuristics for detecting superseded content
_CORRECTION_PATTERNS = [
    re.compile(r"^(?:actually|correction|sorry|wait|no,)\b", re.IGNORECASE),
    re.compile(r"\b(?:instead|rather|update|revised|changed? (?:to|my))\b", re.IGNORECASE),
]


class Compressor:
    def __init__(
        self,
        config: Optional[CompressorConfig] = None,
        summarizer: Optional[SummarizerFn] = None,
    ) -> None:
        cfg = config or CompressorConfig()
        self._pin_top = cfg.pin_top
        self._recent_turns = cfg.recent_turns
        self._prune_older_than = cfg.prune_older_than_turns
        self._prune_if_superseded = cfg.prune_if_superseded
        self._summary_max_tokens = cfg.summary_max_tokens
        self._summarizer = summarizer

    def process(
        self, messages: list[Message],
    ) -> tuple[list[Message], list[tuple[int, int]]]:
        """Run the three-pass pipeline. Returns (processed_messages, compressed_ranges)."""
        classified = self._classify(messages)
        classified = self._summarize(classified)
        return self._prune(classified)

    # ------------------------------------------------------------------
    # Pass 1: Classify
    # ------------------------------------------------------------------

    def _classify(self, messages: list[Message]) -> list[ClassifiedMessage]:
        n = len(messages)
        classified: list[ClassifiedMessage] = []

        # Count conversational turns (user/assistant pairs) from the end
        # to determine "recent" boundary
        turn_count = 0
        recent_boundary = self._pin_top  # default: everything after pinned is recent
        for i in range(n - 1, -1, -1):
            if messages[i].role in ("user", "assistant"):
                turn_count += 1
                if turn_count >= self._recent_turns * 2:  # 2 messages per turn
                    recent_boundary = i
                    break

        for i, msg in enumerate(messages):
            if i < self._pin_top:
                bucket = Bucket.PINNED
            elif i >= recent_boundary:
                bucket = Bucket.RECENT
            else:
                # Check age (by turn count from start)
                turns_from_start = sum(
                    1 for m in messages[:i + 1]
                    if m.role in ("user", "assistant")
                ) // 2
                if turns_from_start > self._prune_older_than:
                    bucket = Bucket.PRUNABLE
                else:
                    bucket = Bucket.COMPRESSIBLE

            classified.append(ClassifiedMessage(
                message=msg,
                index=i,
                bucket=bucket,
            ))

        # Superseded detection
        if self._prune_if_superseded:
            classified = self._mark_superseded(classified)

        return classified

    def _mark_superseded(
        self, classified: list[ClassifiedMessage],
    ) -> list[ClassifiedMessage]:
        """Mark messages as prunable if superseded by later content."""
        # Track tool_call_ids: if a later tool result shares the same
        # tool_call_id pattern (same tool called again), earlier is superseded
        tool_results: dict[str, int] = {}  # name -> latest index
        for cm in classified:
            if cm.message.role == "tool" and cm.message.name:
                prev = tool_results.get(cm.message.name)
                if prev is not None:
                    # Mark the earlier one as prunable
                    if classified[prev].bucket == Bucket.COMPRESSIBLE:
                        classified[prev] = ClassifiedMessage(
                            message=classified[prev].message,
                            index=classified[prev].index,
                            bucket=Bucket.PRUNABLE,
                        )
                tool_results[cm.message.name] = cm.index

        # Mark user messages that are corrections of earlier messages
        for cm in classified:
            if cm.bucket != Bucket.COMPRESSIBLE or cm.message.role != "user":
                continue
            for pat in _CORRECTION_PATTERNS:
                if pat.search(cm.message.content):
                    # The message this corrects is likely the previous user message
                    # in the compressible zone — mark it prunable
                    for prev in reversed(classified[:cm.index]):
                        if prev.message.role == "user" and prev.bucket == Bucket.COMPRESSIBLE:
                            classified[prev.index] = ClassifiedMessage(
                                message=prev.message,
                                index=prev.index,
                                bucket=Bucket.PRUNABLE,
                            )
                            break
                    break

        return classified

    # ------------------------------------------------------------------
    # Pass 2: Summarize
    # ------------------------------------------------------------------

    def _summarize(
        self, classified: list[ClassifiedMessage],
    ) -> list[ClassifiedMessage]:
        """Summarize compressible messages. Without a summarizer, moves them to prunable."""
        if self._summarizer is None:
            # No summarizer provided — compressible becomes prunable
            return [
                ClassifiedMessage(
                    message=cm.message,
                    index=cm.index,
                    bucket=Bucket.PRUNABLE if cm.bucket == Bucket.COMPRESSIBLE else cm.bucket,
                )
                for cm in classified
            ]

        # Group consecutive compressible messages for batch summarization
        result: list[ClassifiedMessage] = []
        i = 0
        while i < len(classified):
            cm = classified[i]
            if cm.bucket != Bucket.COMPRESSIBLE:
                result.append(cm)
                i += 1
                continue

            # Collect consecutive compressible block
            block: list[ClassifiedMessage] = []
            while i < len(classified) and classified[i].bucket == Bucket.COMPRESSIBLE:
                block.append(classified[i])
                i += 1

            # Build text to summarize
            text_parts = [f"[{m.message.role}]: {m.message.content}" for m in block]
            combined = "\n".join(text_parts)

            try:
                summary = self._summarizer(combined)
            except Exception:
                # If summarizer fails, keep original messages
                result.extend(block)
                continue

            # Replace block with a single summarized assistant message
            summary_msg = Message(
                role="assistant",
                content=f"[Summary of turns {block[0].index}-{block[-1].index}]: {summary}",
                metadata={"statis_kit_summary": True},
            )
            result.append(ClassifiedMessage(
                message=summary_msg,
                index=block[0].index,
                bucket=Bucket.RECENT,  # Keep summaries
            ))

        return result

    # ------------------------------------------------------------------
    # Pass 3: Prune
    # ------------------------------------------------------------------

    def _prune(
        self, classified: list[ClassifiedMessage],
    ) -> tuple[list[Message], list[tuple[int, int]]]:
        """Drop prunable messages. Returns (messages, compressed_ranges)."""
        output: list[Message] = []
        compressed_ranges: list[tuple[int, int]] = []

        # Track consecutive pruned ranges
        prune_start: Optional[int] = None

        for cm in classified:
            if cm.bucket == Bucket.PRUNABLE:
                if prune_start is None:
                    prune_start = cm.index
            else:
                if prune_start is not None:
                    compressed_ranges.append((prune_start, cm.index - 1))
                    prune_start = None
                output.append(cm.message)

        # Close any trailing prune range
        if prune_start is not None and classified:
            compressed_ranges.append((prune_start, classified[-1].index))

        return output, compressed_ranges
