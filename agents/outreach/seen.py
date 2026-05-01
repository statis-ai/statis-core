"""Cross-run prospect dedupe — track which LinkedIn handles we've already
proposed a connection request for, regardless of decision.

Each `linkedin_send_connection_request` action ever proposed (ESCALATED,
APPROVED, DENIED, FAILED, COMPLETED — all of them) parks a recipient_profile
in its parameters. That's the LinkedIn URL of the founder. We extract the
canonical handle and use the set as a dedupe filter for new agent runs.

Two resolution paths in priority order:
  1. (precise) DATABASE_URL set -> direct SQL on action_contracts.
  2. (heuristic fallback) /actions API filter, paginated. Slower at scale
     but works without DB credentials.
"""
from __future__ import annotations

import os
from typing import Iterable

import httpx


AGENT_ID = "outreach-agent"


def linkedin_handle(url: str | None) -> str:
    """Return the canonical LinkedIn handle for a profile URL, or "" if not a
    LinkedIn profile.

    Examples:
      'https://www.linkedin.com/in/jiangdawang/'         -> 'jiangdawang'
      'https://linkedin.com/in/zihong-chen'              -> 'zihong-chen'
      'https://www.linkedin.com/in/anayrshukla/?utm=...' -> 'anayrshukla'
      ''                                                  -> ''
    """
    if not url:
        return ""
    u = url.strip().lower()
    needle = "linkedin.com/in/"
    if needle not in u:
        return ""
    handle = u.split(needle, 1)[1]
    handle = handle.split("?", 1)[0]
    handle = handle.split("/", 1)[0]
    handle = handle.split("#", 1)[0]
    return handle.strip().rstrip("/")


def _via_db() -> set[str] | None:
    db_url = os.environ.get("DATABASE_URL")
    if not db_url:
        return None
    try:
        import psycopg  # type: ignore
    except ImportError:
        return None
    out: set[str] = set()
    with psycopg.connect(db_url) as conn:
        with conn.cursor() as cur:
            cur.execute(
                """SELECT DISTINCT parameters->>'recipient_profile' AS profile
                   FROM action_contracts
                   WHERE proposed_by = %s
                     AND action_type = %s
                     AND parameters ? 'recipient_profile'""",
                (AGENT_ID, "linkedin_send_connection_request"),
            )
            for (profile,) in cur.fetchall():
                h = linkedin_handle(profile)
                if h:
                    out.add(h)
    return out


def _via_api(base_url: str, api_key: str, limit: int = 10000) -> set[str]:
    """Fallback: pull from /actions and dedupe in Python."""
    out: set[str] = set()
    with httpx.Client(
        base_url=base_url.rstrip("/"),
        headers={"X-API-Key": api_key},
        timeout=30.0,
    ) as c:
        # No status filter — pull all states (ESCALATED, COMPLETED, FAILED, ...)
        for status in ("ESCALATED", "COMPLETED", "FAILED", "DENIED", "APPROVED"):
            resp = c.get("/actions", params={"status": status, "limit": limit})
            if not resp.is_success:
                continue
            data = resp.json()
            actions = data if isinstance(data, list) else data.get("actions", [])
            for a in actions:
                if (
                    a.get("proposed_by") != AGENT_ID
                    or a.get("action_type") != "linkedin_send_connection_request"
                ):
                    continue
                profile = (a.get("parameters") or {}).get("recipient_profile")
                h = linkedin_handle(profile)
                if h:
                    out.add(h)
    return out


def fetch_seen_handles(base_url: str, api_key: str) -> set[str]:
    """Return the set of LinkedIn handles we've already processed.

    Prefers DB (precise); falls back to API (slower, capped at /actions limit).
    """
    via_db = _via_db()
    if via_db is not None:
        return via_db
    return _via_api(base_url, api_key)


def filter_unseen(candidates: Iterable, seen: set[str]) -> list:
    """Filter candidates by removing those whose target_linkedin_url's
    canonical handle is in `seen`. Returns a fresh list."""
    out = []
    for c in candidates:
        handle = linkedin_handle(getattr(c, "target_linkedin_url", None))
        if handle and handle in seen:
            continue
        out.append(c)
    return out
