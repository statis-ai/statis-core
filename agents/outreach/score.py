"""Score stage — Statis Kit hygiene + Claude scoring + Statis gate."""
from __future__ import annotations

import hashlib
import json
from dataclasses import asdict, dataclass
from typing import Any

from statis import StatisClient, ActionDeniedError, ActionEscalatedError
from statis_kit import process as kit_process
from statis_kit import KitConfig, GuardConfig, CompressorConfig, MeterConfig

from .llm import call_claude_json
from .research import Candidate


AGENT_ID = "outreach-agent"


@dataclass
class ScoredProspect:
    candidate: Candidate
    icp_score: int
    score_breakdown: dict[str, int]
    reasoning: str
    inferred_role: str | None
    inferred_company: str | None
    kit_report: dict[str, Any]
    statis_action_id: str | None  # the prospect_scored receipt
    decision: str  # APPROVED | DENIED | ESCALATED

    def to_dict(self) -> dict[str, Any]:
        d = asdict(self)
        d["candidate"] = self.candidate.to_dict()
        return d


_SCORING_SYSTEM = """You are an analyst scoring prospects for Statis — a trust/governance layer for production AI agents.

Score each prospect 0-100 on ICP fit:
- signal_recency (0-40): How recent and concrete is their public pain about agent trust/governance?
- role_seniority (0-30): Are they a Staff/Principal eng, EM, Head of AI, founding eng, or CTO?
- production_evidence (0-20): Do they actually ship agents that touch production APIs?
- stage_fit (0-10): Series A-C startup or SMB sweet spot? F500 / pre-product disqualified.

Return ONLY a JSON object with this exact shape:
{
  "icp_score": <0-100 int>,
  "score_breakdown": {"signal_recency": <int>, "role_seniority": <int>, "production_evidence": <int>, "stage_fit": <int>},
  "reasoning": "<1-2 sentence why>",
  "inferred_role": "<best guess role or null>",
  "inferred_company": "<best guess company or null>",
  "disqualified": <true|false>,
  "disqualifier_reason": "<reason or null>"
}
Do NOT include any text outside the JSON."""


def _kit_clean(text: str) -> tuple[str, dict[str, Any]]:
    """Run scraped text through Statis Kit before showing it to Claude.

    Treats the scraped material as a 'user' message; Guard catches injection
    patterns, Compressor trims, Meter records token cost.
    """
    cfg = KitConfig(
        guard=GuardConfig(on_detect="strip"),
        compressor=CompressorConfig(pin_top=0, recent_turns=1),
        meter=MeterConfig(model="claude-sonnet-4-5"),
    )
    result = kit_process([{"role": "user", "content": text}], cfg)
    cleaned = result.messages[0]["content"] if result.messages else text
    report = {
        "original_tokens": result.report.original_tokens,
        "processed_tokens": result.report.processed_tokens,
        "token_delta": result.report.token_delta,
        "cost_usd": result.report.cost_estimate.usd if result.report.cost_estimate else 0.0,
        "guard_detections": len(result.report.guard_detections),
        "stripped_payloads": result.report.stripped_payloads,
    }
    return cleaned, report


def score_one(client: StatisClient, candidate: Candidate) -> ScoredProspect | None:
    cleaned_text, kit_report = _kit_clean(candidate.signal_text)

    user_prompt = (
        f"Source: {candidate.source}\n"
        f"Author: {candidate.author_handle} ({candidate.author_url})\n"
        f"Signal URL: {candidate.signal_url}\n"
        f"Signal seen at: {candidate.signal_seen_at}\n"
        f"Matched keyword: {candidate.matched_keyword}\n"
        f"Signal text:\n{cleaned_text}\n"
    )

    try:
        scored = call_claude_json(_SCORING_SYSTEM, user_prompt)
    except Exception as e:
        print(f"  ! score llm error for {candidate.author_handle}: {e}")
        return None

    icp_score = int(scored.get("icp_score", 0))

    # Stable action_id for idempotency: tied to (source, signal_url)
    aid_seed = f"score:{candidate.source}:{candidate.signal_url}"
    action_id = "score-" + hashlib.sha256(aid_seed.encode()).hexdigest()[:24]

    target_id = f"{candidate.source}:{candidate.author_handle or 'unknown'}"
    decision = "UNKNOWN"
    statis_action_id: str | None = None

    try:
        receipt = client.execute(
            action_id=action_id,
            action_type="prospect_scored",
            target={"entity_type": "prospect", "entity_id": target_id},
            target_system="prospect_scored",
            agent_id=AGENT_ID,
            parameters={
                "source": candidate.source,
                "signal_url": candidate.signal_url,
                "icp_score": icp_score,
                "kit_token_delta": kit_report["token_delta"],
                "kit_cost_usd": kit_report["cost_usd"],
                "kit_guard_detections": kit_report["guard_detections"],
            },
            context={
                "icp_score": icp_score,
                "signal_seen_at": candidate.signal_seen_at,
                "kit_report": kit_report,
                "disqualified": scored.get("disqualified", False),
            },
            timeout=10.0,
        )
        decision = "APPROVED"
        statis_action_id = receipt.action_id
    except ActionDeniedError as e:
        decision = "DENIED"
        statis_action_id = e.receipt.action_id if e.receipt else None
    except ActionEscalatedError as e:
        decision = "ESCALATED"
        statis_action_id = e.action_id

    return ScoredProspect(
        candidate=candidate,
        icp_score=icp_score,
        score_breakdown=scored.get("score_breakdown", {}),
        reasoning=scored.get("reasoning", ""),
        inferred_role=scored.get("inferred_role"),
        inferred_company=scored.get("inferred_company"),
        kit_report=kit_report,
        statis_action_id=statis_action_id,
        decision=decision,
    )
