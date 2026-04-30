"""Score stage — Statis Kit hygiene + Claude scoring + Statis gate."""
from __future__ import annotations

import hashlib
import json
from dataclasses import asdict, dataclass
from typing import Any

from statis import StatisClient, ActionDeniedError, ActionEscalatedError, ActionTimeoutError
from statis_kit import Guard, GuardConfig, messages_from_dicts

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

Statis itself does:
- Pillar 1: Context In — prompt-injection defense, PII redaction, token cost metering (pre-LLM hygiene)
- Pillar 2: Action Out — policy-gated tool execution with human-in-loop escalation
- Pillar 3: Receipt Through — cryptographically tamper-evident audit ledger

Score each prospect 0-100 on ICP fit:
- signal_recency (0-40): How recent and concrete is their public pain about agent trust/governance?
- role_seniority (0-30): Are they a Staff/Principal eng, EM, Head of AI, founding eng, or CTO?
- production_evidence (0-20): Do they actually ship agents that touch production APIs?
- stage_fit (0-10): Series A-C startup or SMB sweet spot? F500 / pre-product disqualified.

DISQUALIFY (set disqualified=true) if the prospect's company is a direct competitor or
overlapping product. Specifically these categories are competitors/overlap:
- Production monitoring or observability for AI agents (overlap with Pillar 3)
- LLM/AI context compression, prompt-injection guards, token-cost meters as a product (Pillar 1)
- Agent governance / agent gateway / agent permissions / agent kill-switch / agent audit
  layers offered as a standalone product (Pillar 2)
- "Trust layer" / "compliance layer" / "Sentry for AI" framing for agents
- Anything explicitly framed as "policy-gated tool execution" or "tamper-evident receipts"
  for AI agents

NOT competitors (keep these — they're customer profiles):
- Agents that DO things (coding agents, ops agents, SDR agents, customer-support agents,
  legal/medical/financial agent products) — they USE Statis, they aren't Statis
- Agent frameworks (LangChain, CrewAI, AutoGen) — partners/integration targets
- Vector DBs, retrieval, evaluation tools — adjacent, not overlapping

Return ONLY a JSON object with this exact shape:
{
  "icp_score": <0-100 int>,
  "score_breakdown": {"signal_recency": <int>, "role_seniority": <int>, "production_evidence": <int>, "stage_fit": <int>},
  "reasoning": "<1-2 sentence why>",
  "inferred_role": "<best guess role or null>",
  "inferred_company": "<best guess company or null>",
  "disqualified": <true|false>,
  "disqualifier_reason": "<reason or null — say 'competitor' or 'overlap' if disqualifying for that reason>"
}
Do NOT include any text outside the JSON."""


_GUARD = Guard(GuardConfig(on_detect="strip"))


def _kit_clean(text: str) -> tuple[str, dict[str, Any]]:
    """Run scraped text through Statis Kit Guard before showing it to the LLM.

    Strips known prompt-injection patterns from the scraped material so a
    malicious tweet/comment can't hijack our scoring or drafting prompts.
    """
    msgs = messages_from_dicts([{"role": "user", "content": text}])
    result = _GUARD.scan(msgs)
    cleaned = result.messages[0].content if result.messages else text
    report = {
        "guard_detections": len(result.detections),
        "stripped_payloads": [d.turn_index for d in result.detections],
    }
    return cleaned, report


def score_one(client: StatisClient, candidate: Candidate, run_id: str = "v0") -> ScoredProspect | None:
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

    # Stable action_id within a run: tied to (run_id, source, signal_url, target).
    # Including target disambiguates per-founder candidates that share a company.
    target_key = candidate.target_linkedin_url or candidate.target_name or candidate.author_handle or "company-only"
    aid_seed = f"score:{run_id}:{candidate.source}:{candidate.signal_url}:{target_key}"
    action_id = "score-" + hashlib.sha256(aid_seed.encode()).hexdigest()[:24]

    target_id = f"{candidate.source}:{candidate.target_name or candidate.author_handle or 'unknown'}"
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
                "kit_guard_detections": kit_report["guard_detections"],
            },
            context={
                "icp_score": icp_score,
                "signal_seen_at": candidate.signal_seen_at,
                "kit_report": kit_report,
                "disqualified": scored.get("disqualified", False),
            },
            timeout=2.0,
        )
        decision = "APPROVED"
        statis_action_id = receipt.action_id
    except ActionDeniedError as e:
        decision = "DENIED"
        statis_action_id = e.receipt.action_id if e.receipt else None
    except ActionEscalatedError as e:
        decision = "ESCALATED"
        statis_action_id = e.action_id
    except ActionTimeoutError as e:
        # APPROVED but worker hasn't executed yet — fire-and-forget, action exists on ledger
        decision = "APPROVED_PENDING"
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
