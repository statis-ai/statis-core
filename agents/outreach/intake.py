"""Intake stage — pre-LLM ICP gate.

Cheap, deterministic policy filter applied to every research candidate
*before* the (expensive) LLM scoring call. Keeps the score budget tight
and adds a receipt for every disqualification.
"""
from __future__ import annotations

import hashlib
from dataclasses import dataclass
from typing import Any

from statis import StatisClient, ActionDeniedError, ActionEscalatedError, ActionTimeoutError

from .enrich import is_aggregator, is_competitor
from .research import Candidate
from .score import AGENT_ID  # reuse the agent identity


@dataclass
class IntakeDecision:
    candidate: Candidate
    decision: str  # APPROVED | APPROVED_PENDING | DENIED | ESCALATED
    statis_action_id: str | None


def intake_one(
    client: StatisClient, candidate: Candidate, run_id: str = "v0"
) -> IntakeDecision:
    target_key = candidate.target_linkedin_url or candidate.target_name or candidate.author_handle or "company-only"
    aid_seed = f"intake:{run_id}:{candidate.source}:{candidate.signal_url}:{target_key}"
    action_id = "intake-" + hashlib.sha256(aid_seed.encode()).hexdigest()[:24]
    target_id = f"{candidate.source}:{candidate.target_name or candidate.author_handle or 'unknown'}"

    competitor_text = (
        f"{candidate.company_name or ''} {candidate.signal_text or ''}"
    )
    is_comp, comp_match = is_competitor(competitor_text)

    decision = "UNKNOWN"
    statis_action_id: str | None = None

    try:
        receipt = client.execute(
            action_id=action_id,
            action_type="prospect_intake",
            target={"entity_type": "prospect", "entity_id": target_id},
            target_system="prospect_intake",
            agent_id=AGENT_ID,
            parameters={
                "source": candidate.source,
                "signal_url": candidate.signal_url,
                "author_handle": candidate.author_handle or "",
                "matched_keyword": candidate.matched_keyword,
                "company_name": candidate.company_name or "",
                "company_url": candidate.company_url or "",
                "company_domain": candidate.company_domain or "",
                "company_batch": candidate.company_batch or "",
            },
            context={
                "source": candidate.source,
                "signal_seen_at": candidate.signal_seen_at,
                "signal_length": len(candidate.signal_text or ""),
                "matched_keyword": candidate.matched_keyword,
                "dnc": False,
                "tier": candidate.tier,
                "company_domain": candidate.company_domain or "",
                "domain_verified": candidate.domain_verified,
                "is_aggregator_domain": is_aggregator(candidate.company_domain),
                "company_batch": candidate.company_batch or "",
                "company_name": candidate.company_name or "",
                "is_competitor": is_comp,
                "competitor_match": comp_match,
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
        decision = "APPROVED_PENDING"
        statis_action_id = e.action_id

    return IntakeDecision(
        candidate=candidate, decision=decision, statis_action_id=statis_action_id
    )
