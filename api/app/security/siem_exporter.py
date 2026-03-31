"""SIEM export pipeline — sends receipt events to Datadog and Splunk on action completion.

Both exporters are fire-and-forget: failures are logged, never raised.
Configured entirely via environment variables; disabled by default.
"""
from __future__ import annotations

import json
import logging
import os

logger = logging.getLogger(__name__)


def _env_bool(name: str, default: bool = False) -> bool:
    return os.getenv(name, str(default)).strip().lower() in ("1", "true", "yes")


class SIEMExporter:
    """Export action completion events to configured SIEM backends."""

    def export(self, action, receipt) -> None:
        """Fire-and-forget export to configured SIEM backends.

        Parameters
        ----------
        action:  ActionContract — the completed action
        receipt: Receipt — the finalized receipt
        """
        event = self._build_event(action, receipt)

        if _env_bool("SIEM_DATADOG_ENABLED"):
            self._export_datadog(event)

        if _env_bool("SIEM_SPLUNK_ENABLED"):
            self._export_splunk(event)

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    @staticmethod
    def _build_event(action, receipt) -> dict:
        return {
            "timestamp": receipt.created_at.isoformat(),
            "service": "statis",
            "tenant_id": action.tenant_id,
            "action_id": action.action_id,
            "action_type": action.action_type,
            "target_system": action.target_system,
            "decision": receipt.decision,
            "status": action.status,
            "receipt_id": receipt.receipt_id,
            "receipt_hash": receipt.hash,
            "mode": action.mode,
        }

    def _export_datadog(self, event: dict) -> None:
        api_key = os.getenv("SIEM_DATADOG_API_KEY", "")
        host = os.getenv(
            "SIEM_DATADOG_HOST", "https://http-intake.logs.datadoghq.com"
        ).rstrip("/")
        url = f"{host}/api/v2/logs"
        payload = [
            {
                "ddsource": "statis",
                "service": "statis-receipts",
                "message": json.dumps(event),
            }
        ]
        try:
            import httpx

            resp = httpx.post(
                url,
                json=payload,
                headers={"DD-API-KEY": api_key, "Content-Type": "application/json"},
                timeout=3.0,
            )
            if resp.status_code >= 300:
                logger.warning(
                    "SIEM Datadog export failed: status=%d body=%s",
                    resp.status_code,
                    resp.text[:200],
                )
            else:
                logger.debug("SIEM Datadog export OK (status=%d)", resp.status_code)
        except Exception as exc:
            logger.warning("SIEM Datadog export error (non-fatal): %s", exc)

    def _export_splunk(self, event: dict) -> None:
        hec_url = os.getenv("SIEM_SPLUNK_HEC_URL", "").rstrip("/")
        token = os.getenv("SIEM_SPLUNK_HEC_TOKEN", "")
        if not hec_url:
            logger.warning("SIEM Splunk enabled but SIEM_SPLUNK_HEC_URL is not set")
            return
        url = f"{hec_url}/services/collector/event"
        payload = {"event": event, "sourcetype": "statis:receipt"}
        try:
            import httpx

            resp = httpx.post(
                url,
                json=payload,
                headers={
                    "Authorization": f"Splunk {token}",
                    "Content-Type": "application/json",
                },
                timeout=3.0,
            )
            if resp.status_code >= 300:
                logger.warning(
                    "SIEM Splunk export failed: status=%d body=%s",
                    resp.status_code,
                    resp.text[:200],
                )
            else:
                logger.debug("SIEM Splunk export OK (status=%d)", resp.status_code)
        except Exception as exc:
            logger.warning("SIEM Splunk export error (non-fatal): %s", exc)
