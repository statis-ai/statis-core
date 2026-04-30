"""Statis design-partner outreach agent — daily entrypoint.

    python -m agents.outreach.main --max-prospects 5

Stages: research -> score -> draft -> send -> log. Every meaningful event
is gated through Statis. Receipts land on https://console.statis.dev.
"""
from __future__ import annotations

import argparse
import os
import sys
from datetime import datetime, timezone

from statis import StatisClient

from .draft import draft_one
from .intake import intake_one
from .qualify import qualify_one
from .research import discover
from .score import score_one
from .send import send_and_log


def main() -> int:
    p = argparse.ArgumentParser()
    p.add_argument("--max-prospects", type=int, default=5)
    p.add_argument("--max-per-source", type=int, default=3)
    p.add_argument(
        "--run-id",
        default=datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ"),
        help="Per-run nonce in action_ids; defaults to current UTC timestamp",
    )
    p.add_argument(
        "--base-url",
        default=os.environ.get("STATIS_BASE_URL", "https://statis-core.onrender.com"),
    )
    args = p.parse_args()

    if not os.environ.get("STATIS_API_KEY"):
        print("ERROR: STATIS_API_KEY not set", file=sys.stderr)
        return 2
    if not (os.environ.get("OPENAI_API_KEY") or os.environ.get("ANTHROPIC_API_KEY")):
        print("ERROR: set OPENAI_API_KEY or ANTHROPIC_API_KEY", file=sys.stderr)
        return 2

    print(f"== run_id: {args.run_id} ==")
    print(f"== Stage 1: research (max {args.max_per_source}/source) ==")
    candidates = discover(max_per_source=args.max_per_source)
    print(f"  found {len(candidates)} candidates")
    if not candidates:
        return 0
    candidates = candidates[: args.max_prospects]

    client = StatisClient(base_url=args.base_url)
    receipts_seen: list[str] = []

    try:
        print(f"\n== Stage 2: intake gate ({len(candidates)} candidates) ==")
        admitted: list = []
        for c in candidates:
            i = intake_one(client, c, run_id=args.run_id)
            print(
                f"  {(c.author_handle or '?'):<24} {c.source:<8} len={len(c.signal_text):>4} "
                f"intake={i.decision:<10} aid={i.statis_action_id}"
            )
            if i.statis_action_id:
                receipts_seen.append(i.statis_action_id)
            if i.decision in ("APPROVED", "APPROVED_PENDING"):
                admitted.append(c)
        print(f"  admitted: {len(admitted)}/{len(candidates)}")

        print(f"\n== Stage 3: score ({len(admitted)} candidates) ==")
        scored: list = []
        for c in admitted:
            s = score_one(client, c, run_id=args.run_id)
            if s is None:
                continue
            scored.append(s)
            print(
                f"  {s.candidate.author_handle or '?':<24} score={s.icp_score:>3} "
                f"decision={s.decision:<10} aid={s.statis_action_id}"
            )
            if s.statis_action_id:
                receipts_seen.append(s.statis_action_id)

        print(f"\n== Stage 4: qualify gate ==")
        qualified: list = []
        for s in scored:
            q = qualify_one(client, s, run_id=args.run_id)
            print(
                f"  {s.candidate.author_handle or '?':<24} score={s.icp_score:>3} "
                f"qualify={q.decision:<10} aid={q.statis_action_id}"
            )
            if q.statis_action_id:
                receipts_seen.append(q.statis_action_id)
            if q.decision in ("APPROVED", "APPROVED_PENDING"):
                qualified.append(s)
        print(f"  qualified: {len(qualified)}/{len(scored)}")

        print(f"\n== Stage 5: draft ==")
        drafts: list = []
        for s in qualified:
            d = draft_one(client, s, run_id=args.run_id)
            if d is None:
                continue
            drafts.append(d)
            preview = d.message_body.replace("\n", " ")[:80]
            print(
                f"  {d.scored.candidate.author_handle or '?':<24} "
                f"draft_decision={d.decision:<10} aid={d.statis_action_id}"
            )
            print(f"    > {preview}{'...' if len(d.message_body) > 80 else ''}")
            if d.statis_action_id:
                receipts_seen.append(d.statis_action_id)

        print(f"\n== Stage 6+7: send + log ==")
        for d in drafts:
            r = send_and_log(client, d, run_id=args.run_id)
            print(
                f"  {d.scored.candidate.author_handle or '?':<24} "
                f"send={r['send_decision']:<10} log={r['log_decision']:<10}"
            )
            if r["send_action_id"]:
                receipts_seen.append(r["send_action_id"])
            if r["log_action_id"]:
                receipts_seen.append(r["log_action_id"])
    finally:
        client.close()

    print(f"\n== Done ==")
    print(f"  receipts/escalations created: {len(receipts_seen)}")
    print(f"  console: https://console.statis.dev")
    print(f"  csv:     agents/outreach/outreach_log.csv")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
