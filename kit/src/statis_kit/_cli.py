"""statis-kit CLI — context diff viewer."""
from __future__ import annotations

import argparse
import json
import sys
from typing import Any

# ANSI color codes
_RESET = "\033[0m"
_RED = "\033[31m"
_GREEN = "\033[32m"
_YELLOW = "\033[33m"
_CYAN = "\033[36m"
_DIM = "\033[2m"
_BOLD = "\033[1m"


def _load_json(path: str) -> list[dict[str, Any]]:
    try:
        with open(path) as f:
            data = json.load(f)
    except (json.JSONDecodeError, OSError) as e:
        sys.exit(f"Error reading {path}: {e}")
    if not isinstance(data, list):
        sys.exit(f"Error: {path} must contain a JSON array of messages.")
    return data


def _truncate(text: str, max_len: int = 80) -> str:
    if len(text) <= max_len:
        return text
    return text[:max_len - 3] + "..."


def cmd_diff(args: argparse.Namespace) -> None:
    before = _load_json(args.before)
    after = _load_json(args.after)

    if args.json:
        _diff_json(before, after)
    else:
        _diff_colored(before, after)


def _diff_colored(
    before: list[dict[str, Any]],
    after: list[dict[str, Any]],
) -> None:
    from .cost_meter import CostMeter

    meter = CostMeter()

    before_tokens = sum(meter.count_tokens(m.get("content", "")) for m in before)
    after_tokens = sum(meter.count_tokens(m.get("content", "")) for m in after)
    delta = before_tokens - after_tokens
    pct = (delta / before_tokens * 100) if before_tokens > 0 else 0

    print(f"\n{_BOLD}Context Diff{_RESET}")
    print(f"  Before: {len(before)} messages, {before_tokens} tokens")
    print(f"  After:  {len(after)} messages, {after_tokens} tokens")

    if delta > 0:
        print(f"  Delta:  {_GREEN}-{delta} tokens ({pct:.1f}% reduction){_RESET}")
    elif delta < 0:
        print(f"  Delta:  {_RED}+{-delta} tokens ({-pct:.1f}% increase){_RESET}")
    else:
        print(f"  Delta:  {_DIM}no change{_RESET}")

    print()

    # Build content maps for comparison
    before_set = {(m.get("role", ""), m.get("content", "")) for m in before}
    after_set = {(m.get("role", ""), m.get("content", "")) for m in after}

    removed = before_set - after_set
    added = after_set - before_set

    for m in before:
        key = (m.get("role", ""), m.get("content", ""))
        role = m.get("role", "?")
        content = _truncate(m.get("content", ""))
        if key in removed:
            print(f"  {_RED}- [{role}] {content}{_RESET}")
        else:
            print(f"  {_DIM}  [{role}] {content}{_RESET}")

    for m in after:
        key = (m.get("role", ""), m.get("content", ""))
        if key in added:
            role = m.get("role", "?")
            content = _truncate(m.get("content", ""))
            print(f"  {_GREEN}+ [{role}] {content}{_RESET}")

    print()


def _diff_json(
    before: list[dict[str, Any]],
    after: list[dict[str, Any]],
) -> None:
    from .cost_meter import CostMeter

    meter = CostMeter()

    before_tokens = sum(meter.count_tokens(m.get("content", "")) for m in before)
    after_tokens = sum(meter.count_tokens(m.get("content", "")) for m in after)

    before_set = {(m.get("role", ""), m.get("content", "")) for m in before}
    after_set = {(m.get("role", ""), m.get("content", "")) for m in after}

    removed = [
        {"role": m.get("role", ""), "content": m.get("content", "")}
        for m in before
        if (m.get("role", ""), m.get("content", "")) in (before_set - after_set)
    ]
    added = [
        {"role": m.get("role", ""), "content": m.get("content", "")}
        for m in after
        if (m.get("role", ""), m.get("content", "")) in (after_set - before_set)
    ]

    output = {
        "before_messages": len(before),
        "after_messages": len(after),
        "before_tokens": before_tokens,
        "after_tokens": after_tokens,
        "token_delta": before_tokens - after_tokens,
        "removed": removed,
        "added": added,
    }
    print(json.dumps(output, indent=2))


def cmd_process(args: argparse.Namespace) -> None:
    """Process a message file through the kit pipeline."""
    from . import process

    messages = _load_json(args.file)
    result = process(messages)

    if args.json:
        output = {
            "messages": result.messages,
            "report": {
                "original_tokens": result.report.original_tokens,
                "processed_tokens": result.report.processed_tokens,
                "token_delta": result.report.token_delta,
                "guard_detections": len(result.report.guard_detections),
                "compressed_ranges": result.report.compressed_ranges,
            },
        }
        print(json.dumps(output, indent=2))
    else:
        r = result.report
        print(f"\n{_BOLD}Processing Report{_RESET}")
        print(f"  Messages:    {len(messages)} -> {len(result.messages)}")
        print(f"  Tokens:      {r.original_tokens} -> {r.processed_tokens} ({_GREEN}-{r.token_delta}{_RESET})")
        if r.guard_detections:
            print(f"  Detections:  {_YELLOW}{len(r.guard_detections)} injection pattern(s){_RESET}")
        if r.compressed_ranges:
            print(f"  Compressed:  {len(r.compressed_ranges)} range(s)")
        if r.cost_estimate:
            print(f"  Est. cost:   ${r.cost_estimate.total_cost_usd:.6f} ({r.cost_estimate.model})")
        print()


def main() -> None:
    parser = argparse.ArgumentParser(
        prog="statis-kit",
        description="Offline context processing for LLM message arrays",
    )
    sub = parser.add_subparsers(dest="command", required=True)

    p_diff = sub.add_parser("diff", help="Compare two message arrays")
    p_diff.add_argument("before", help="Path to before messages JSON")
    p_diff.add_argument("after", help="Path to after messages JSON")
    p_diff.add_argument("--json", action="store_true", help="JSON output for CI")

    p_proc = sub.add_parser("process", help="Process a message array through the kit")
    p_proc.add_argument("file", help="Path to messages JSON")
    p_proc.add_argument("--json", action="store_true", help="JSON output")

    args = parser.parse_args()

    if args.command == "diff":
        cmd_diff(args)
    elif args.command == "process":
        cmd_process(args)


if __name__ == "__main__":
    main()
