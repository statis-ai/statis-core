"""Statis execution worker — takes APPROVED actions and executes them exactly once.

Run standalone:
    python -m worker.execute          (from project root)
    python worker/execute.py          (from project root)

Concurrency guard: INSERT INTO execution_locks ON CONFLICT DO NOTHING.
Idempotency guard: skip if receipt.executed_at is already set.
"""

from __future__ import annotations

import importlib
import logging
import os
import sys
import threading
import time
import uuid
from datetime import datetime, timezone
from typing import Any

# Allow importing from the api/ package regardless of cwd
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "api"))

from sqlalchemy import create_engine, delete, select
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.orm import Session, sessionmaker

from app.adapters.airflow import AirflowAdapter
from app.adapters.filesystem import FilesystemAdapter
from app.adapters.generic import GenericAdapter
from app.adapters.hubspot import HubSpotAdapter
from app.adapters.github import GitHubAdapter
from app.adapters.linear import LinearAdapter
from app.adapters.mcp import MCPAdapter
from app.adapters.salesforce import SalesforceAdapter
from app.adapters.slack_adapter import SlackAdapter
from app.adapters.zendesk import ZendeskAdapter
from app.adapters.base import BaseAdapter
from app.adapters.stripe_mock import MockStripeAdapter
from app.config import settings
from app.models.action_contract import ActionContract
from app.models.escalation_review import EscalationReview
from app.models.execution_lock import ExecutionLock
from app.models.receipt import Receipt
from app.security.r1_gate import pre_execute_check

# AARM R1 — require a valid Ed25519 signature before dispatch.
# Default False so dev environments without STATIS_SIGNING_PRIVATE_KEY
# continue to run; production MUST set STATIS_WORKER_REQUIRE_SIGNATURE=1
# to enforce signed-receipts-or-no-dispatch.
_REQUIRE_SIGNATURE = os.getenv("STATIS_WORKER_REQUIRE_SIGNATURE", "0") == "1"

POLL_INTERVAL = float(os.getenv("POLL_INTERVAL", "1"))
BATCH_SIZE = int(os.getenv("BATCH_SIZE", "10"))
WORKER_ID = os.getenv("WORKER_ID", str(uuid.uuid4()))

_ADAPTERS_YAML = os.path.join(os.path.dirname(__file__), "adapters.yaml")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)
logger = logging.getLogger("execute-worker")

# Reload flag — set by the watchdog thread, cleared by the main loop
_reload_pending = threading.Event()


def _build_default_adapters() -> dict[str, BaseAdapter]:
    _generic = GenericAdapter()
    return {
        "stripe": MockStripeAdapter(),
        "airflow": AirflowAdapter(),
        "salesforce": SalesforceAdapter(),
        "zendesk": ZendeskAdapter(),
        "hubspot": HubSpotAdapter(),
        "filesystem": FilesystemAdapter(allowed_prefix=os.getenv("FILESYSTEM_ADAPTER_ALLOWED_PREFIX")),
        "mcp": MCPAdapter(),
        "github": GitHubAdapter(),
        "linear": LinearAdapter(),
        "slack": SlackAdapter(),
        # Keel action types — log-only via GenericAdapter
        "log_expense": _generic,
        "propose_trade": _generic,
        "update_budget": _generic,
        "log_tax_entry": _generic,
    }


def _load_adapters_from_yaml(path: str) -> dict[str, BaseAdapter] | None:
    """Load adapter registry from adapters.yaml. Returns None on any failure."""
    try:
        import yaml  # type: ignore
    except ImportError:
        logger.debug("pyyaml not installed — skipping YAML adapter registry")
        return None

    try:
        with open(path) as f:
            config = yaml.safe_load(f)
        entries = config.get("adapters", {})
        registry: dict[str, BaseAdapter] = {}
        _generic = GenericAdapter()
        for key, class_path in entries.items():
            module_path, class_name = class_path.rsplit(".", 1)
            try:
                mod = importlib.import_module(module_path)
                cls = getattr(mod, class_name)
                # FilesystemAdapter requires allowed_prefix kwarg
                if class_name == "FilesystemAdapter":
                    registry[key] = cls(allowed_prefix=os.getenv("FILESYSTEM_ADAPTER_ALLOWED_PREFIX"))
                elif class_name == "GenericAdapter":
                    registry[key] = _generic
                else:
                    registry[key] = cls()
            except Exception as exc:
                logger.warning("Failed to load adapter %s=%s: %s", key, class_path, exc)
        return registry
    except Exception as exc:
        logger.warning("Failed to load adapters.yaml: %s", exc)
        return None


def _init_adapters() -> dict[str, BaseAdapter]:
    if os.path.exists(_ADAPTERS_YAML):
        registry = _load_adapters_from_yaml(_ADAPTERS_YAML)
        if registry is not None:
            logger.info("Adapter registry loaded from adapters.yaml: %s", list(registry.keys()))
            return registry
    return _build_default_adapters()


# Adapter registry: target_system → adapter instance
ADAPTERS: dict[str, BaseAdapter] = _init_adapters()


def _start_adapter_watcher() -> None:
    """Watch adapters.yaml for changes using watchdog (if installed). Gracefully skips if not."""
    try:
        from watchdog.observers import Observer  # type: ignore
        from watchdog.events import FileSystemEventHandler  # type: ignore

        class _Handler(FileSystemEventHandler):
            def on_modified(self, event):
                if os.path.abspath(event.src_path) == os.path.abspath(_ADAPTERS_YAML):
                    _reload_pending.set()

        observer = Observer()
        observer.schedule(_Handler(), path=os.path.dirname(_ADAPTERS_YAML), recursive=False)
        observer.daemon = True
        observer.start()
        logger.info("Watching %s for adapter registry changes", _ADAPTERS_YAML)
    except ImportError:
        logger.info("watchdog not installed — hot-reload disabled. Install with: pip install watchdog")


def _maybe_reload_adapters() -> None:
    """Reload the adapter registry if adapters.yaml changed. Called between poll cycles."""
    if not _reload_pending.is_set():
        return
    _reload_pending.clear()
    new_registry = _load_adapters_from_yaml(_ADAPTERS_YAML)
    if new_registry is not None:
        ADAPTERS.clear()
        ADAPTERS.update(new_registry)
        logger.info("adapter_registry_reloaded adapters=%s", list(ADAPTERS.keys()))


def make_session_factory() -> sessionmaker:
    engine = create_engine(settings.database_url, future=True)
    return sessionmaker(bind=engine, autoflush=False, autocommit=False, class_=Session)


def _fetch_approved(db: Session, batch_size: int) -> list[Any]:
    """Return up to batch_size APPROVED action contracts (no row lock — lock is the execution_locks PK).

    Excludes shadow actions (mode='shadow') and only includes live actions or rows with no mode
    set (NULL, for backward compatibility with pre-shadow-mode records).
    """
    stmt = (
        select(ActionContract)
        .where(ActionContract.status == "APPROVED")
        .where(ActionContract.mode.in_(["live", None]))
        .limit(batch_size)
    )
    return db.execute(stmt).scalars().all()


def _already_executed(db: Session, action_id: str) -> bool:
    """True if the receipt for this action already has an executed_at timestamp."""
    row = db.execute(
        select(Receipt).where(
            Receipt.action_id == action_id,
            Receipt.executed_at.isnot(None),
        )
    ).scalar_one_or_none()
    return row is not None


def _try_acquire_lock(db: Session, action_id: str) -> bool:
    """Insert execution lock. Returns True if this worker won the race.

    Uses RETURNING to reliably detect insertion vs. conflict — psycopg3
    does not always report rowcount correctly for INSERT ON CONFLICT DO NOTHING.
    """
    result = db.execute(
        pg_insert(ExecutionLock)
        .values(
            action_id=action_id,
            worker_id=WORKER_ID,
            acquired_at=datetime.now(timezone.utc),
        )
        .on_conflict_do_nothing(index_elements=["action_id"])
        .returning(ExecutionLock.action_id)
    )
    return result.fetchone() is not None


def _release_lock(db: Session, action_id: str) -> None:
    db.execute(delete(ExecutionLock).where(ExecutionLock.action_id == action_id))


def process_action(db: Session, action: ActionContract) -> None:
    """Execute a single APPROVED action.  All DB mutations go through *db*; caller commits."""

    action_id = action.action_id

    # Idempotency: skip if already executed (e.g. worker crash after execute but before commit)
    if _already_executed(db, action_id):
        logger.info("Action %s already executed, skipping", action_id)
        action.status = "COMPLETED"
        return

    # Acquire distributed lock — if another worker beat us, skip silently
    if not _try_acquire_lock(db, action_id):
        logger.debug("Lock for action %s held by another worker, skipping", action_id)
        return

    # AARM R1 — pre-execution interception. Before any adapter is
    # touched, re-verify that the action carries a receipt with an
    # ALLOW-class decision and (optionally) a valid Ed25519 signature.
    # This is the last line of defense against a DB-level tamper that
    # flipped status to APPROVED without going through the policy engine.
    receipt = (
        db.query(Receipt).filter(Receipt.action_id == action_id).first()
    )
    gate = pre_execute_check(
        action, receipt, require_signature=_REQUIRE_SIGNATURE
    )
    if not gate.ok:
        logger.warning(
            "R1 gate refused dispatch for action %s: %s",
            action_id, gate.reason,
        )
        _finalize(
            db, action, success=False,
            execution_result={
                "error": "r1_gate_refused",
                "reason": gate.reason,
            },
        )
        return

    # Mark EXECUTING atomically with the lock acquisition (already flushed above)
    action.status = "EXECUTING"
    db.commit()

    logger.info("Executing action %s (type=%s, target=%s)", action_id, action.action_type, action.target_system)

    # Resolve adapter
    adapter = ADAPTERS.get(action.target_system)
    if adapter is None:
        _finalize(
            db, action, success=False,
            execution_result={"error": f"No adapter for target_system={action.target_system!r}"},
        )
        return

    # Check if this action was human-approved after escalation — include reviewer in receipt
    review = db.query(EscalationReview).filter(EscalationReview.action_id == action_id).first()

    # Call external system — outside any long-held transaction
    exec_result = adapter.execute(action)

    result_payload = exec_result.result if exec_result.success else {"error": exec_result.error}
    if review is not None:
        result_payload = {
            **result_payload,
            "escalation_review": {
                "review_id": review.review_id,
                "reviewer_id": review.reviewer_id,
                "reviewer_decision": review.reviewer_decision,
                "reviewed_at": review.reviewed_at.isoformat(),
            },
        }
    _finalize(db, action, success=exec_result.success, execution_result=result_payload)


def _deliver_webhooks(db: Session, action: ActionContract, receipt: Any) -> None:
    """Deliver webhook notifications for a terminal action. Fires-and-forgets with retry."""
    try:
        from app.models.webhook import Webhook  # type: ignore
    except ImportError:
        return

    status_to_event = {
        "COMPLETED": "action.completed",
        "FAILED": "action.completed",  # completed (failed) — still a terminal execution
        "DENIED": "action.denied",
        "ESCALATED": "action.escalated",
        "SHADOW_COMPLETE": "action.completed",
    }
    event_type = status_to_event.get(action.status)
    if event_type is None:
        return

    webhooks = (
        db.query(Webhook)
        .filter(
            Webhook.tenant_id == action.tenant_id,
            Webhook.is_active.is_(True),
        )
        .all()
    )
    if not webhooks:
        return

    payload = {
        "event": event_type,
        "action_id": action.action_id,
        "action_type": action.action_type,
        "status": action.status,
        "tenant_id": action.tenant_id,
    }
    if receipt is not None:
        payload["receipt_id"] = getattr(receipt, "receipt_id", None)
        payload["decision"] = getattr(receipt, "decision", None)

    import json
    import time as _time

    try:
        import httpx  # type: ignore

        payload_bytes = json.dumps(payload).encode("utf-8")
        for webhook in webhooks:
            if event_type not in (webhook.events or []):
                continue
            for attempt in range(3):
                try:
                    resp = httpx.post(
                        webhook.url,
                        content=payload_bytes,
                        headers={"Content-Type": "application/json"},
                        timeout=5.0,
                    )
                    if resp.status_code < 300:
                        logger.info("Webhook delivered to %s (attempt %d)", webhook.url, attempt + 1)
                        break
                    logger.warning(
                        "Webhook %s returned %d (attempt %d/3)", webhook.url, resp.status_code, attempt + 1
                    )
                except Exception as exc:
                    logger.warning("Webhook %s failed (attempt %d/3): %s", webhook.url, attempt + 1, exc)
                if attempt < 2:
                    _time.sleep(2 ** attempt)  # 1s, 2s backoff
    except ImportError:
        logger.debug("httpx not available — webhook delivery skipped")


def _finalize(
    db: Session,
    action: ActionContract,
    success: bool,
    execution_result: dict,
) -> None:
    """Write execution outcome to receipt + update action status + release lock, all in one commit."""
    executed_at = datetime.now(timezone.utc)

    db.execute(
        Receipt.__table__.update()
        .where(Receipt.action_id == action.action_id)
        .values(executed_at=executed_at, execution_result=execution_result)
    )
    action.status = "COMPLETED" if success else "FAILED"
    _release_lock(db, action.action_id)
    db.commit()

    logger.info(
        "Action %s → %s | result=%s",
        action.action_id,
        action.status,
        execution_result,
    )

    # Fire webhooks after commit — non-blocking, never raises
    receipt = db.query(Receipt).filter(Receipt.action_id == action.action_id).first()
    try:
        _deliver_webhooks(db, action, receipt)
    except Exception:
        logger.exception("Webhook delivery error for action %s (non-fatal)", action.action_id)

    # SIEM export — fire-and-forget, never raises
    if receipt is not None:
        try:
            from app.security.siem_exporter import SIEMExporter
            SIEMExporter().export(action, receipt)
        except Exception:
            logger.exception("SIEM export error for action %s (non-fatal)", action.action_id)

    # OpenTelemetry export — fire-and-forget, never raises
    if receipt is not None:
        try:
            from app.observability.otel_exporter import OTelExporter
            OTelExporter().export(action, receipt)
        except Exception:
            logger.exception("OTel export error for action %s (non-fatal)", action.action_id)


def run_once(session_factory: sessionmaker) -> int:
    """Run one poll cycle. Returns number of actions processed."""
    db = session_factory()
    try:
        actions = _fetch_approved(db, batch_size=BATCH_SIZE)
        if not actions:
            return 0

        for action in actions:
            try:
                process_action(db, action)
            except Exception:
                db.rollback()
                logger.exception("Error processing action %s", action.action_id)

        return len(actions)
    except Exception:
        db.rollback()
        logger.exception("Error in execution poll cycle")
        return 0
    finally:
        db.close()


def main() -> None:
    logger.info(
        "Execution worker starting (worker_id=%s, poll every %.1fs)",
        WORKER_ID,
        POLL_INTERVAL,
    )
    sf = make_session_factory()
    _start_adapter_watcher()

    while True:
        _maybe_reload_adapters()
        processed = run_once(sf)
        if processed:
            logger.info("Processed %d approved actions", processed)
        time.sleep(POLL_INTERVAL)


if __name__ == "__main__":
    main()
