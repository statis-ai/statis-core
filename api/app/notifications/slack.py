"""
Slack incoming-webhook notifier.

Fire-and-forget — failures are logged as warnings and never propagate.
Enabled by setting SLACK_WEBHOOK_URL in the environment.
"""

import logging
import os

import httpx

logger = logging.getLogger(__name__)


class SlackNotifier:
    def __init__(self, webhook_url: str | None = None) -> None:
        self._url = webhook_url or os.getenv("SLACK_WEBHOOK_URL", "")

    def notify_escalation(
        self,
        action_id: str,
        action_type: str,
        proposed_by: str,
        tenant_id: str,
        console_url: str | None = None,
    ) -> None:
        """Post an escalation alert to Slack. Never raises."""
        if not self._url:
            return

        review_url = console_url or os.getenv("FRONTEND_URL", "http://localhost:3000")
        escalation_link = f"{review_url.rstrip('/')}/escalations"

        payload: dict = {
            "text": f":warning: Action escalated — human review required",
            "blocks": [
                {
                    "type": "header",
                    "text": {
                        "type": "plain_text",
                        "text": ":warning: Action Escalated",
                        "emoji": True,
                    },
                },
                {
                    "type": "section",
                    "fields": [
                        {"type": "mrkdwn", "text": f"*Action ID*\n`{action_id}`"},
                        {"type": "mrkdwn", "text": f"*Action Type*\n`{action_type}`"},
                        {"type": "mrkdwn", "text": f"*Proposed By*\n`{proposed_by}`"},
                        {"type": "mrkdwn", "text": f"*Tenant*\n`{tenant_id}`"},
                    ],
                },
                {
                    "type": "actions",
                    "elements": [
                        {
                            "type": "button",
                            "text": {
                                "type": "plain_text",
                                "text": "Review in Console",
                                "emoji": True,
                            },
                            "url": escalation_link,
                            "style": "primary",
                        }
                    ],
                },
            ],
        }

        try:
            httpx.post(self._url, json=payload, timeout=5.0)
        except Exception:
            logger.warning(
                "Slack escalation notification failed for action_id=%s",
                action_id,
                exc_info=True,
            )
