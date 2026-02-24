"""Statis delivery worker — polls pending deliveries and sends webhooks."""

import logging
import os
import sys
import time

# Allow importing from the api/ package
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "api"))

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.config import settings
from deliver import fetch_pending, process_delivery

POLL_INTERVAL = float(os.getenv("POLL_INTERVAL", "1"))

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)
logger = logging.getLogger("worker")


def make_session_factory() -> sessionmaker:
    # Use settings.database_url so we get psycopg (v3) driver, not raw postgresql://
    engine = create_engine(settings.database_url, future=True)
    return sessionmaker(bind=engine, autoflush=False, autocommit=False, class_=Session)


def run_once(session_factory: sessionmaker) -> int:
    """Run a single poll cycle. Returns number of deliveries processed."""
    db = session_factory()
    try:
        deliveries = fetch_pending(db)
        if not deliveries:
            return 0

        for delivery in deliveries:
            process_delivery(db, delivery)

        db.commit()
        return len(deliveries)
    except Exception:
        db.rollback()
        logger.exception("Error in poll cycle")
        return 0
    finally:
        db.close()


def main() -> None:
    logger.info("Delivery worker starting (poll every %.1fs)", POLL_INTERVAL)
    sf = make_session_factory()

    while True:
        processed = run_once(sf)
        if processed:
            logger.info("Processed %d deliveries", processed)
        time.sleep(POLL_INTERVAL)


if __name__ == "__main__":
    main()
