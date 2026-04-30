"""T2 researcher — YC recent batches with agent capabilities.

Pulls structured data from yc-oss (https://yc-oss.github.io/api/) for the
last few batches, filters to agent-flavored companies, verifies each
company's website is a live root domain, scrapes the YC company page for
founder names + LinkedIn URLs, and emits ONE Candidate per founder.

The verified domain is the hard gate: no domain → no candidate. Aggregator
hosts (github.io, vercel.app, etc.) are auto-rejected upstream by enrich.py.

If a company has multiple founders, we emit multiple Candidates so each
person flows through scoring + drafting independently and gets a draft
addressed to them by name.
"""
from __future__ import annotations

import html as html_mod
import json
import re
import urllib.request
from datetime import datetime, timezone
from typing import Any

from .enrich import verify_domain
from .research import Candidate


# Default batches considered "recent" — overrideable via discover(batches=...)
DEFAULT_BATCHES: list[str] = [
    "winter-2026",
    "fall-2025",
    "summer-2025",
    "winter-2025",
]

# Batch slug → ISO month start used for signal_seen_at when launched_at is empty.
_BATCH_TO_DATE: dict[str, str] = {
    "winter-2026": "2026-01-15T00:00:00+00:00",
    "fall-2025": "2025-10-15T00:00:00+00:00",
    "summer-2025": "2025-07-15T00:00:00+00:00",
    "winter-2025": "2025-01-15T00:00:00+00:00",
    "spring-2026": "2026-04-15T00:00:00+00:00",
}

# Strong-signal text match — tag-based filtering is too noisy (security firewalls,
# physical robotics, etc. all carry "AI" tags).
_AGENT_TEXT_RE = re.compile(
    r"\b(ai\s*agent|agents|agentic|ai\s*engineer|autonomous\s*ai|llm[- ]native)\b",
    re.IGNORECASE,
)


def _http_get_json(url: str, timeout: float = 15.0) -> Any:
    req = urllib.request.Request(url, headers={"User-Agent": "statis-outreach-agent/0.2"})
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return json.loads(resp.read().decode("utf-8"))


def _http_get_text(url: str, timeout: float = 15.0) -> str:
    req = urllib.request.Request(
        url, headers={"User-Agent": "Mozilla/5.0 statis-outreach-agent/0.2"}
    )
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return resp.read().decode("utf-8", "ignore")


# Match a single user/founder JSON object embedded in the YC company page's
# inline script. The page HTML-escapes JSON via &quot;; we unescape upstream.
_FOUNDER_BLOCK_RE = re.compile(
    r'\{\"user_id\":\d+,(?:[^{}]|\{[^{}]*\})*?\"latest_yc_company\":\{[^}]+\}\}'
)


def fetch_founders(slug: str) -> list[dict[str, Any]]:
    """Scrape the YC company page for founders.

    Returns a list of {name, role, linkedin_url, twitter_url, bio} dicts.
    Filters to entries where title=='Founder' and a linkedin_url is present.
    """
    try:
        html = _http_get_text(f"https://www.ycombinator.com/companies/{slug}")
    except Exception:
        return []

    # The page embeds founder data inside an HTML-escaped JSON blob in a
    # <script> tag. Unescape, then regex-find the JSON object blocks.
    unescaped = html_mod.unescape(html)

    out: list[dict[str, Any]] = []
    for raw_block in _FOUNDER_BLOCK_RE.findall(unescaped):
        try:
            obj = json.loads(raw_block)
        except json.JSONDecodeError:
            continue
        title = (obj.get("title") or "").strip().lower()
        if title != "founder":
            continue
        if not obj.get("linkedin_url"):
            continue
        out.append({
            "name": obj.get("full_name"),
            "role": obj.get("title") or "Founder",
            "linkedin_url": obj.get("linkedin_url"),
            "twitter_url": obj.get("twitter_url"),
            "bio": (obj.get("founder_bio") or "")[:600],
        })
    return out


def _is_agent_match(company: dict[str, Any]) -> tuple[bool, str]:
    """Return (matched, matched_keyword) for the agent-flavor filter."""
    text = (company.get("one_liner") or "") + " " + (company.get("long_description") or "")
    match = _AGENT_TEXT_RE.search(text)
    if match:
        return True, match.group(0).lower().strip()
    return False, ""


def _signal_seen_at(company: dict[str, Any]) -> str:
    launched = company.get("launched_at")
    if launched:
        try:
            return datetime.fromtimestamp(int(launched), tz=timezone.utc).isoformat()
        except (TypeError, ValueError):
            pass
    batch = (company.get("batch") or "").lower().replace(" ", "-")
    return _BATCH_TO_DATE.get(batch, datetime.now(timezone.utc).isoformat())


def discover(
    batches: list[str] | None = None,
    max_per_batch: int = 25,
    verify_domains: bool = True,
    fetch_founders_per_company: bool = True,
) -> list[Candidate]:
    """Pull YC companies from recent batches matching the agent filter.

    Verifies each company's website domain unless verify_domains=False (test mode).
    Candidates without a verified domain are dropped — the intake policy would
    deny them anyway, so we save the round-trip.

    For each matching company, scrapes the YC company page for the founder
    list and emits ONE Candidate per founder (with target_name +
    target_linkedin_url populated). This is the intake/scoring/drafting
    funnel's preferred shape — each cold message is addressed to a specific
    person, not a generic 'founder/CEO' placeholder.

    Companies with no resolvable founders are still emitted as a single
    Candidate (target left empty) so they don't silently disappear.
    """
    batches = batches or DEFAULT_BATCHES
    out: list[Candidate] = []
    seen_slugs: set[str] = set()
    seen_companies = 0

    for batch in batches:
        try:
            companies = _http_get_json(
                f"https://yc-oss.github.io/api/batches/{batch}.json"
            )
        except Exception as e:
            print(f"  ! yc batch fetch failed {batch}: {e}")
            continue

        kept = 0
        for c in companies:
            if kept >= max_per_batch:
                break
            slug = c.get("slug") or c.get("name", "")
            if not slug or slug in seen_slugs:
                continue

            matched, kw = _is_agent_match(c)
            if not matched:
                continue

            website = c.get("website") or ""
            if not website:
                continue

            if verify_domains:
                check = verify_domain(website)
                if not check.verified:
                    continue
                domain = check.domain
                live = check.live
            else:
                from .enrich import extract_root, is_aggregator
                domain = extract_root(website)
                if not domain or is_aggregator(domain):
                    continue
                live = False

            seen_slugs.add(slug)
            seen_companies += 1

            yc_url = c.get("url") or f"https://www.ycombinator.com/companies/{slug}"
            tags = list(c.get("tags") or [])
            company_name = c.get("name") or slug

            text_summary = (
                f"YC {c.get('batch')}: {company_name} — {c.get('one_liner') or ''}\n\n"
                f"{(c.get('long_description') or '')[:1500]}"
            ).strip()

            shared_extra = {
                "team_size": c.get("team_size"),
                "industries": c.get("industries"),
                "status": c.get("status"),
                "yc_slug": slug,
            }

            founders = (
                fetch_founders(slug) if fetch_founders_per_company else []
            )

            if founders:
                # Emit one Candidate per founder. Each gets its own funnel pass.
                for f in founders:
                    out.append(
                        Candidate(
                            source="yc",
                            signal_url=yc_url,
                            signal_text=(
                                f"{text_summary}\n\nFounder: {f['name']} ({f['role']}).\n"
                                f"Founder bio: {f['bio']}"
                            ),
                            signal_seen_at=_signal_seen_at(c),
                            author_handle=f["name"] or company_name,
                            author_url=f["linkedin_url"] or yc_url,
                            matched_keyword=kw,
                            tier=2,
                            company_name=company_name,
                            company_url=website,
                            company_domain=domain,
                            domain_verified=live,
                            company_batch=c.get("batch"),
                            company_tags=tags,
                            company_stage=f"yc-{(c.get('batch') or '').lower().replace(' ', '-')}",
                            target_role=f["role"],
                            target_name=f["name"],
                            target_linkedin_url=f["linkedin_url"],
                            extra={
                                **shared_extra,
                                "founder_bio": f["bio"],
                                "twitter_url": f.get("twitter_url"),
                            },
                        )
                    )
            else:
                # Couldn't resolve founders — emit one company-level Candidate so
                # the operator can still see it in the funnel and decide.
                out.append(
                    Candidate(
                        source="yc",
                        signal_url=yc_url,
                        signal_text=text_summary + "\n\n(No founder LinkedIn URLs resolved from YC page.)",
                        signal_seen_at=_signal_seen_at(c),
                        author_handle=company_name,
                        author_url=yc_url,
                        matched_keyword=kw,
                        tier=2,
                        company_name=company_name,
                        company_url=website,
                        company_domain=domain,
                        domain_verified=live,
                        company_batch=c.get("batch"),
                        company_tags=tags,
                        company_stage=f"yc-{(c.get('batch') or '').lower().replace(' ', '-')}",
                        target_role="Founder/CEO",
                        target_name=None,
                        target_linkedin_url=None,
                        extra=shared_extra,
                    )
                )
            kept += 1

    return out
