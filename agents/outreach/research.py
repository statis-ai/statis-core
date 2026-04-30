"""Research stage — discover ICP signals from public, read-only sources.

No gating needed (no side effects). Returns a list of Candidate dicts that
flow into the Score stage.
"""
from __future__ import annotations

import json
import urllib.parse
import urllib.request
from dataclasses import asdict, dataclass, field
from datetime import datetime, timedelta, timezone
from typing import Any


ICP_KEYWORDS = [
    "agent broke prod",
    "agent governance",
    "agent permissions",
    "ai guardrails",
    "agent kill switch",
    "agent audit",
    "agent hallucinated",
    "ai compliance",
    "agent oversight",
    "human in the loop agent",
    "agent did something",
]


@dataclass
class Candidate:
    source: str  # "hn" | "github" | "yc"
    signal_url: str
    signal_text: str
    signal_seen_at: str  # ISO-8601 UTC
    author_handle: str | None
    author_url: str | None
    matched_keyword: str

    # Tiering — set by the researcher that produced this candidate.
    tier: int = 1

    # Company-level enrichment. Required to pass the intake domain gate.
    company_name: str | None = None
    company_url: str | None = None
    company_domain: str | None = None  # extracted root, e.g. "acme.ai"
    domain_verified: bool = False
    company_batch: str | None = None  # e.g. "Winter 2026" for YC
    company_tags: list[str] = field(default_factory=list)
    company_stage: str | None = None  # e.g. "yc-w26", "seed", "seriesA"

    # Decision-maker, populated when known (T2 YC has founders; T1 sometimes).
    target_role: str | None = None  # "Founder/CEO", "CTO", etc.
    target_name: str | None = None
    target_linkedin_url: str | None = None

    extra: dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


def _http_get_json(url: str, timeout: float = 10.0) -> dict[str, Any]:
    req = urllib.request.Request(url, headers={"User-Agent": "statis-outreach-agent/0.1"})
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return json.loads(resp.read().decode("utf-8"))


def search_hn(keyword: str, hours: int = 168, limit: int = 10) -> list[Candidate]:
    since = int((datetime.now(timezone.utc) - timedelta(hours=hours)).timestamp())
    q = urllib.parse.quote(keyword)
    url = (
        f"https://hn.algolia.com/api/v1/search_by_date"
        f"?query={q}&tags=(story,comment)&numericFilters=created_at_i>{since}&hitsPerPage={limit}"
    )
    try:
        data = _http_get_json(url)
    except Exception:
        return []

    out: list[Candidate] = []
    for hit in data.get("hits", []):
        text = hit.get("comment_text") or hit.get("story_text") or hit.get("title") or ""
        author = hit.get("author")
        story_id = hit.get("objectID")
        signal_url = (
            f"https://news.ycombinator.com/item?id={story_id}" if story_id else hit.get("url", "")
        )
        out.append(
            Candidate(
                source="hn",
                signal_url=signal_url,
                signal_text=text[:2000],
                signal_seen_at=datetime.fromtimestamp(
                    hit.get("created_at_i", 0), tz=timezone.utc
                ).isoformat(),
                author_handle=author,
                author_url=f"https://news.ycombinator.com/user?id={author}" if author else None,
                matched_keyword=keyword,
                extra={"points": hit.get("points"), "story_id": story_id},
            )
        )
    return out


def search_github_issues(keyword: str, limit: int = 10) -> list[Candidate]:
    q = urllib.parse.quote(f'"{keyword}" in:title,body is:issue')
    url = f"https://api.github.com/search/issues?q={q}&sort=created&order=desc&per_page={limit}"
    try:
        data = _http_get_json(url)
    except Exception:
        return []

    out: list[Candidate] = []
    for item in data.get("items", []):
        user = item.get("user", {}) or {}
        out.append(
            Candidate(
                source="github",
                signal_url=item.get("html_url", ""),
                signal_text=(item.get("title", "") + "\n\n" + (item.get("body") or ""))[:2000],
                signal_seen_at=item.get("created_at", ""),
                author_handle=user.get("login"),
                author_url=user.get("html_url"),
                matched_keyword=keyword,
                extra={
                    "repo": item.get("repository_url", "").split("/repos/")[-1],
                    "comments": item.get("comments"),
                },
            )
        )
    return out


def discover(max_per_source: int = 5, keywords: list[str] | None = None) -> list[Candidate]:
    """Pull candidates across HN + GitHub. Deduped by (source, signal_url)."""
    kws = keywords or ICP_KEYWORDS[:6]  # cap to keep API budget tight
    seen: set[tuple[str, str]] = set()
    results: list[Candidate] = []

    for kw in kws:
        for c in search_hn(kw, limit=max_per_source):
            key = (c.source, c.signal_url)
            if key in seen or not c.signal_text or not c.author_handle:
                continue
            seen.add(key)
            results.append(c)
        for c in search_github_issues(kw, limit=max_per_source):
            key = (c.source, c.signal_url)
            if key in seen or not c.signal_text or not c.author_handle:
                continue
            seen.add(key)
            results.append(c)

    return results
