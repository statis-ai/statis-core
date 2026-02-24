import os
from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session, sessionmaker

from app.db.session import get_db
from app.main import app
from app.models.api_key import ApiKey
import hashlib
import uuid


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


@pytest.fixture()
def db_session(migrated_postgres_url: str) -> Generator[Session, None, None]:
    engine = create_engine(migrated_postgres_url, future=True)
    SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, class_=Session)
    with SessionLocal() as session:
        session.execute(text("TRUNCATE TABLE deliveries, subscriptions, entity_state, events, api_keys CASCADE"))
        
        # Create a default API key for tests
        raw_key = "test_key_123"
        hashed_key = hashlib.sha256(raw_key.encode()).hexdigest()
        api_key = ApiKey(
            id=str(uuid.uuid4()),
            hashed_key=hashed_key,
            tenant_id="test_tenant_1",
            label="Test Key"
        )
        session.add(api_key)
        session.commit()
        
        yield session
    engine.dispose()


@pytest.fixture()
def client(db_session: Session) -> Generator[TestClient, None, None]:
    def _get_test_db() -> Generator[Session, None, None]:
        yield db_session

    app.dependency_overrides[get_db] = _get_test_db
    try:
        with TestClient(app, headers={"X-API-Key": "test_key_123"}) as test_client:
            yield test_client
    finally:
        app.dependency_overrides.clear()
