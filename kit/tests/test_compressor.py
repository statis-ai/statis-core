import json
import os

from statis_kit._types import CompressorConfig, Message
from statis_kit.compressor import Compressor

FIXTURES = os.path.join(os.path.dirname(__file__), "fixtures")


def _load_messages(name: str) -> list[Message]:
    with open(os.path.join(FIXTURES, name)) as f:
        raw = json.load(f)
    return [Message(
        role=d["role"],
        content=d.get("content", ""),
        name=d.get("name"),
        tool_call_id=d.get("tool_call_id"),
    ) for d in raw]


class TestCompressorBasic:
    def test_short_transcript_unchanged(self):
        """A 10-msg transcript should pass through mostly intact."""
        msgs = _load_messages("transcript_basic.json")
        comp = Compressor(CompressorConfig(pin_top=1, recent_turns=10))
        result, ranges = comp.process(msgs)
        # With recent_turns=10, all should be pinned or recent
        assert len(result) == len(msgs)
        assert ranges == []

    def test_pinned_messages_preserved(self):
        msgs = _load_messages("transcript_long.json")
        comp = Compressor(CompressorConfig(pin_top=1, recent_turns=4))
        result, _ = comp.process(msgs)
        # First message (system) should always be preserved
        assert result[0].role == "system"
        assert "project management" in result[0].content.lower()

    def test_compression_reduces_message_count(self):
        msgs = _load_messages("transcript_long.json")
        comp = Compressor(CompressorConfig(
            pin_top=1,
            recent_turns=4,
            prune_older_than_turns=5,
        ))
        result, ranges = comp.process(msgs)
        assert len(result) < len(msgs)
        assert len(ranges) > 0

    def test_recent_turns_preserved(self):
        msgs = _load_messages("transcript_long.json")
        comp = Compressor(CompressorConfig(pin_top=1, recent_turns=4))
        result, _ = comp.process(msgs)
        # The last message should be preserved
        assert result[-1].content == msgs[-1].content


class TestCompressorWithSummarizer:
    def test_summarizer_called_for_compressible(self):
        msgs = _load_messages("transcript_long.json")
        calls: list[str] = []

        def mock_summarizer(text: str) -> str:
            calls.append(text)
            return "Summarized content."

        comp = Compressor(
            CompressorConfig(pin_top=1, recent_turns=2, prune_older_than_turns=50),
            summarizer=mock_summarizer,
        )
        result, _ = comp.process(msgs)
        # Summarizer should have been called at least once
        assert len(calls) > 0
        # Result should contain summary messages
        summaries = [m for m in result if m.metadata and m.metadata.get("statis_kit_summary")]
        assert len(summaries) > 0

    def test_summarizer_failure_keeps_originals(self):
        msgs = _load_messages("transcript_long.json")

        def failing_summarizer(text: str) -> str:
            raise RuntimeError("LLM call failed")

        comp = Compressor(
            CompressorConfig(pin_top=1, recent_turns=2, prune_older_than_turns=50),
            summarizer=failing_summarizer,
        )
        # Should not raise — graceful degradation
        result, _ = comp.process(msgs)
        assert len(result) > 0


class TestCompressorSuperseded:
    def test_repeated_tool_calls_pruned(self):
        msgs = [
            Message(role="system", content="You are helpful."),
            Message(role="user", content="Check my balance."),
            Message(role="tool", content='{"balance": 100}', name="get_balance", tool_call_id="c1"),
            Message(role="assistant", content="Your balance is $100."),
            Message(role="user", content="Check again."),
            Message(role="tool", content='{"balance": 150}', name="get_balance", tool_call_id="c2"),
            Message(role="assistant", content="Your balance is now $150."),
            Message(role="user", content="Thanks."),
            Message(role="assistant", content="You're welcome!"),
        ]
        comp = Compressor(CompressorConfig(
            pin_top=1,
            recent_turns=2,
            prune_older_than_turns=50,
            prune_if_superseded=True,
        ))
        result, _ = comp.process(msgs)
        # The first get_balance result should be pruned
        tool_results = [m for m in result if m.role == "tool"]
        assert len(tool_results) <= 1

    def test_corrections_prune_earlier(self):
        msgs = [
            Message(role="system", content="You are helpful."),
            Message(role="user", content="Set the color to red."),
            Message(role="assistant", content="Done, color is red."),
            Message(role="user", content="Actually, set it to blue instead."),
            Message(role="assistant", content="Done, color is blue."),
            Message(role="user", content="Perfect, thanks."),
            Message(role="assistant", content="You're welcome!"),
        ]
        comp = Compressor(CompressorConfig(
            pin_top=1,
            recent_turns=2,
            prune_older_than_turns=50,
            prune_if_superseded=True,
        ))
        result, _ = comp.process(msgs)
        # "Set the color to red" should be pruned
        contents = [m.content for m in result]
        assert not any("Set the color to red" in c for c in contents)


class TestCompressorEdgeCases:
    def test_empty_messages(self):
        comp = Compressor()
        result, ranges = comp.process([])
        assert result == []
        assert ranges == []

    def test_single_message(self):
        msgs = [Message(role="system", content="Hello")]
        comp = Compressor()
        result, ranges = comp.process(msgs)
        assert len(result) == 1
        assert ranges == []

    def test_all_pinned(self):
        msgs = [Message(role="user", content=f"Msg {i}") for i in range(3)]
        comp = Compressor(CompressorConfig(pin_top=10))
        result, ranges = comp.process(msgs)
        assert len(result) == 3
        assert ranges == []
