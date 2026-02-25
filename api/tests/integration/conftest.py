from __future__ import annotations

import os
import hashlib
import uuid
from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session, sessionmaker

from app.db.session import get_db
from app.main import app
from app.models.api_key import ApiKey

# Raw key constants shared with test files
TEST_KEY_TENANT1 = "test_key_123"
TEST_KEY_TENANT2 = "test_key_tenant2"
TEST_KEY_BILLING = "test_key_billing"


@pytest.fixture(scope="session")
def postgres_url() -> Generator[str, None, None]:
    postgres_module = pytest.importorskip("testcontainers.postgres")
    PostgresContainer = postgres_module.PostgresContainer
    with PostgresContainer("postgres:16") as postgres:
        yield postgres.get_connection_url().replace("psycopg2", "psycopg")


@pytest.fixture(scope="session")
def migrated_postgres_url(postgres_url: str) -> str:
    alembic_command = pytest.importorskip("alembic.command")
    alembic_config = pytest.importorskip("alembic.config")
    Config = alembic_config.Config

    os.environ["DATABASE_URL"] = postgres_url
    alembic_cfg = Config("alembic.ini")
    alembic_cfg.set_main_option("sqlalchemy.url", postgres_url)
    alembic_command.upgrade(alembic_cfg, "head")
    return postgres_url


def _create_api_key(
    session: Session,
    raw_key: str,
    tenant_id: str,
    label: str,
    *,
    role: str | None = None,
    agent_id: str | None = None,
) -> None:
    hashed_key = hashlib.sha256(raw_key.encode()).hexdigest()
    session.add(
        ApiKey(
            id=str(uuid.uuid4()),
            hashed_key=hashed_key,
            tenant_id=tenant_id,
            label=label,
            role=role,
            agent_id=agent_id,
        )
    )


@pytest.fixture()
def db_session(migrated_postgres_url: str) -> Generator[Session, None, None]:
    engine = create_engine(migrated_postgres_url, future=True)
    SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, class_=Session)
    with SessionLocal() as session:
        session.execute(
            text("TRUNCATE TABLE deliveries, subscriptions, entity_state, events, api_keys, quarantine CASCADE")
        )

        _create_api_key(session, TEST_KEY_TENANT1, "test_tenant_1", "Test Key (admin)")
        _create_api_key(session, TEST_KEY_TENANT2, "test_tenant_2", "Test Key Tenant 2")
        _create_api_key(
            session,
            TEST_KEY_BILLING,
            "test_tenant_1",
            "Billing Key",
            role="billing",
            agent_id="billing_agent",
        )
        session.commit()

        yield session
    engine.dispose()


@pytest.fixture()
def client(db_session: Session) -> Generator[TestClient, None, None]:
    def _get_test_db() -> Generator[Session, None, None]:
        yield db_session

    app.dependency_overrides[get_db] = _get_test_db
    try:
        with TestClient(app, headers={"X-API-Key": TEST_KEY_TENANT1}) as test_client:
            yield test_client
    finally:
        app.dependency_overrides.clear()


@pytest.fixture()
def client_tenant2(db_session: Session) -> Generator[TestClient, None, None]:
    """Client authenticated as test_tenant_2."""
    def _get_test_db() -> Generator[Session, None, None]:
        yield db_session

    app.dependency_overrides[get_db] = _get_test_db
    try:
        with TestClient(app, headers={"X-API-Key": TEST_KEY_TENANT2}) as test_client:
            yield test_client
    finally:
        app.dependency_overrides.clear()


@pytest.fixture()
def client_billing(db_session: Session) -> Generator[TestClient, None, None]:
    """Client authenticated as test_tenant_1 with role=billing."""
    def _get_test_db() -> Generator[Session, None, None]:
        yield db_session

    app.dependency_overrides[get_db] = _get_test_db
    try:
        with TestClient(app, headers={"X-API-Key": TEST_KEY_BILLING}) as test_client:
            yield test_client
    finally:
        app.dependency_overrides.clear()
