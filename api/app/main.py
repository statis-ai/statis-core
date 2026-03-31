from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from app.api.routes.actions import router as actions_router
from app.api.routes.events import router as events_router
from app.api.routes.policy_rules import router as policy_rules_router
from app.api.routes.receipts import router as receipts_router
from app.api.routes.state import router as state_router
from app.api.routes.subscriptions import router as subscriptions_router
from app.api.routes.deliveries import router as deliveries_router
from app.api.routes.replay import router as replay_router
from app.api.routes.admin import router as admin_router

import os

# ---------------------------------------------------------------------------
# Rate limiting
# Read limits from env vars so they can be tuned per environment.
# Default: 100 requests/minute per IP globally.
# Auth endpoints (signup/login): 10 requests/minute per IP.
# ---------------------------------------------------------------------------
_rate_limit_default = os.getenv("RATE_LIMIT_DEFAULT", "100/minute")
_rate_limit_auth = os.getenv("RATE_LIMIT_AUTH", "10/minute")

limiter = Limiter(
    key_func=get_remote_address,
    default_limits=[_rate_limit_default],
)

app = FastAPI(title="Statis API")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ---------------------------------------------------------------------------
# CORS
# FRONTEND_URL can be a single URL or comma-separated list (e.g. Console +
# Landing on Vercel).  Localhost origins are only appended in non-production
# environments so that the wider wildcard is never active in prod.
# ---------------------------------------------------------------------------
_frontend_url = os.getenv("FRONTEND_URL", "")
_app_env = os.getenv("APP_ENV", "development")
_origins = [u.strip() for u in _frontend_url.split(",") if u.strip()]

if _app_env != "production" or not _origins:
    # Development / staging: include localhost defaults so local UIs work
    # without requiring FRONTEND_URL to be set.
    _defaults = ["http://localhost:3000", "http://localhost:3001"]
    allow_origins = list(dict.fromkeys(_origins + _defaults))
else:
    # Production: use only the explicitly configured FRONTEND_URL values.
    allow_origins = _origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(actions_router)
app.include_router(events_router)
app.include_router(policy_rules_router)
app.include_router(receipts_router)
app.include_router(state_router)
app.include_router(subscriptions_router)
app.include_router(deliveries_router)
app.include_router(replay_router)
app.include_router(admin_router)


@app.get("/health")
def health() -> dict[str, bool]:
    return {"ok": True}
