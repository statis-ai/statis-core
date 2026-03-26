from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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

app = FastAPI(title="Statis API")

# CORS: FRONTEND_URL can be a single URL or comma-separated list (e.g. Console + Landing on Vercel)
_frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3001")
_origins = [u.strip() for u in _frontend_url.split(",") if u.strip()]
# Always allow localhost for local dev
_defaults = ["http://localhost:3000", "http://localhost:3001"]
allow_origins = list(dict.fromkeys(_origins + _defaults))

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
