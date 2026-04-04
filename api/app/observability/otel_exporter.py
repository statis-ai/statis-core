"""OpenTelemetry OTLP HTTP JSON exporter for Statis receipts.

Exports receipt completion as OTLP HTTP JSON spans so teams can send
Statis governance data to Datadog, Grafana, Honeycomb, or any OTLP-compatible
backend without adding a protobuf dependency.

Enabled by setting OTEL_EXPORTER_OTLP_ENDPOINT (e.g. http://otelcol:4318).
Fire-and-forget. Never raises.
"""
from __future__ import annotations

import logging
import os
import time
import uuid
from typing import Any

logger = logging.getLogger(__name__)


class OTelExporter:
    def export(self, action: Any, receipt: Any) -> None:
        endpoint = os.getenv("OTEL_EXPORTER_OTLP_ENDPOINT", "").rstrip("/")
        if not endpoint:
            return
        try:
            import httpx

            span = self._build_span(action, receipt)
            httpx.post(
                f"{endpoint}/v1/traces",
                json=span,
                timeout=5.0,
            )
        except Exception:
            logger.warning(
                "OTel export failed for action %s (non-fatal)",
                getattr(action, "action_id", "unknown"),
                exc_info=True,
            )

    def _build_span(self, action: Any, receipt: Any) -> dict:
        def _attr(key: str, val: Any) -> dict:
            if isinstance(val, bool):
                return {"key": key, "value": {"boolValue": val}}
            if isinstance(val, int):
                return {"key": key, "value": {"intValue": val}}
            return {"key": key, "value": {"stringValue": str(val or "")}}

        action_id = getattr(action, "action_id", "")
        action_type = getattr(action, "action_type", "")
        proposed_by = getattr(action, "proposed_by", "")
        tenant_id = getattr(action, "tenant_id", "")
        status = getattr(action, "status", "")

        receipt_id = getattr(receipt, "receipt_id", "") if receipt else ""
        decision = getattr(receipt, "decision", "") if receipt else ""
        rule_id = getattr(receipt, "rule_id", "") if receipt else ""
        executed_at = getattr(receipt, "executed_at", None) if receipt else None
        created_at = getattr(receipt, "created_at", None) if receipt else None

        # Duration in ms between receipt creation and execution
        duration_ms = 0
        if executed_at and created_at:
            try:
                duration_ms = int(
                    (executed_at - created_at).total_seconds() * 1000
                )
            except Exception:
                pass

        now_ns = time.time_ns()
        span_id = uuid.uuid4().hex[:16]
        trace_id = uuid.uuid4().hex

        attributes = [
            _attr("statis.action_id", action_id),
            _attr("statis.action_type", action_type),
            _attr("statis.agent_id", proposed_by),
            _attr("statis.tenant_id", tenant_id),
            _attr("statis.decision", decision),
            _attr("statis.rule_id", rule_id),
            _attr("statis.receipt_id", receipt_id),
            _attr("statis.status", status),
            _attr("statis.execution_duration_ms", duration_ms),
        ]

        return {
            "resourceSpans": [
                {
                    "resource": {
                        "attributes": [
                            _attr("service.name", "statis"),
                            _attr("service.version", "1"),
                        ]
                    },
                    "scopeSpans": [
                        {
                            "scope": {"name": "statis.worker"},
                            "spans": [
                                {
                                    "traceId": trace_id,
                                    "spanId": span_id,
                                    "name": f"statis.action.{action_type}",
                                    "kind": 2,  # SPAN_KIND_SERVER
                                    "startTimeUnixNano": str(now_ns - duration_ms * 1_000_000),
                                    "endTimeUnixNano": str(now_ns),
                                    "attributes": attributes,
                                    "status": {
                                        "code": 1 if status == "COMPLETED" else 2
                                    },
                                }
                            ],
                        }
                    ],
                }
            ]
        }
