import os
import sys
from logging.config import fileConfig

# Allow "app" to be imported when running alembic from api/ (e.g. alembic upgrade head)
_api_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _api_dir not in sys.path:
    sys.path.insert(0, _api_dir)

from alembic import context
from sqlalchemy import engine_from_config, pool

from app.db.base import Base
from app.models import event  # noqa: F401
from app.models import entity_state  # noqa: F401
from app.models import subscription  # noqa: F401
from app.models import delivery  # noqa: F401

config = context.config
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

def _normalize_db_url(url: str) -> str:
    """Use psycopg (v3) driver so SQLAlchemy does not load psycopg2."""
    if url.startswith("postgresql://"):
        return "postgresql+psycopg://" + url[len("postgresql://") :]
    if url.startswith("postgres://"):
        return "postgresql+psycopg://" + url[len("postgres://") :]
    return url


db_url = os.getenv("DATABASE_URL")
if db_url:
    config.set_main_option("sqlalchemy.url", _normalize_db_url(db_url))
elif not config.get_main_option("sqlalchemy.url"):
    from app.config import settings
    config.set_main_option("sqlalchemy.url", settings.database_url)

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(url=url, target_metadata=target_metadata, literal_binds=True)
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
