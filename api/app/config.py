import os

from pydantic import BaseModel


def _normalize_database_url(url: str) -> str:
    """Use psycopg (v3) driver so SQLAlchemy does not load psycopg2."""
    if url.startswith("postgresql://"):
        return "postgresql+psycopg://" + url[len("postgresql://") :]
    if url.startswith("postgres://"):
        return "postgresql+psycopg://" + url[len("postgres://") :]
    return url


class Settings(BaseModel):
    database_url: str = _normalize_database_url(
        os.getenv(
            "DATABASE_URL", "postgresql+psycopg://postgres:postgres@localhost:5432/statis"
        )
    )


settings = Settings()
