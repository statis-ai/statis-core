"""Local config — ~/.statis/config.json

Stores the API key and tenant ID written by `statis init` so users
don't have to export STATIS_API_KEY in every terminal session.

Both the CLI and the decorator fall back to this file when the env var
is not set. Env var always wins (no surprises for CI / production).
"""
from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Optional


_CONFIG_DIR = Path.home() / ".statis"
_CONFIG_FILE = _CONFIG_DIR / "config.json"


def config_path() -> Path:
    return _CONFIG_FILE


def load() -> dict:
    """Return the config dict, or {} if it doesn't exist / can't be parsed."""
    try:
        return json.loads(_CONFIG_FILE.read_text())
    except (FileNotFoundError, json.JSONDecodeError):
        return {}


def save(api_key: str, tenant_id: str, base_url: str = "https://api.statis.dev") -> None:
    _CONFIG_DIR.mkdir(parents=True, exist_ok=True)
    _CONFIG_FILE.write_text(
        json.dumps({"api_key": api_key, "tenant_id": tenant_id, "base_url": base_url}, indent=2)
    )
    _CONFIG_FILE.chmod(0o600)  # owner-read/write only — contains a secret


def get_api_key() -> Optional[str]:
    """Return the API key: env var first, then config file."""
    return os.environ.get("STATIS_API_KEY") or load().get("api_key")


def get_base_url() -> str:
    """Return the base URL: env var first, then config file, then default."""
    return (
        os.environ.get("STATIS_BASE_URL")
        or load().get("base_url")
        or "https://api.statis.dev"
    )


def wipe() -> None:
    """Remove the config file (used by statis init --force)."""
    _CONFIG_FILE.unlink(missing_ok=True)
