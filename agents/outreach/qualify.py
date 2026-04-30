"""Qualify stage — post-score ICP gate.

After the LLM has scored a prospect, decide whether to advance to draft.
Splits the funnel: ≥70 + role + not disqualified → APPROVED → draft;
60-69 → ESCALATED for manual triage; <60 or disqualified → DENIED.
"""
from __future__ import annotations

import hashlib
from dataclasses import dataclass

from statis import StatisClient, ActionDeniedError, ActionEscalatedError, ActionTimeoutError

from .score import AGENT_ID, ScoredProspect


@dataclass
class QualifyDecision:
    scored: ScoredProspect
    decision: str  # APPROVED | APPROVED_PENDING | DENIED | ESCALATED
    statis_action_id: str | None


def qualify_one(
    client: StatisClient, scored: ScoredProspect, run_id: str = "v0"
) -> QualifyDecision:
    cand = scored.candidate
    target_key = cand.target_linkedin_url or cand.target_name or cand.author_handle or "company-only"
    aid_seed = f"qualify:{run_id}:{cand.source}:{cand.signal_url}:{target_key}"
    action_id = "qualify-" + hashlib.sha256(aid_seed.encode()).hexdigest()[:24]
    target_id = f"{cand.source}:{cand.target_name or cand.author_handle or 'unknown'}"

    decision = "UNKNOWN"
    statis_action_id: str | None = None

    try:
        receipt = client.execute(
            action_id=action_id,
            action_type="prospect_qualified",
            target={"entity_type": "prospect", "entity_id": target_id},
            target_system="prospect_qualified",
            agent_id=AGENT_ID,
            parameters={
                "source": cand.source,
                "signal_url": cand.signal_url,
                "icp_score": scored.icp_score,
                "inferred_role": scored.inferred_role or "",
                "inferred_company": scored.inferred_company or "",
            },
            context={
                "icp_score": scored.icp_score,
                "inferred_role": scored.inferred_role,
                "disqualified": False,
                "signal_seen_at": cand.signal_seen_at,
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

    return QualifyDecision(
        scored=scored, decision=decision, statis_action_id=statis_action_id
    )
