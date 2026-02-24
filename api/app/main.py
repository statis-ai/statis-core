from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.events import router as events_router
from app.api.routes.state import router as state_router
from app.api.routes.subscriptions import router as subscriptions_router
from app.api.routes.deliveries import router as deliveries_router
from app.api.routes.replay import router as replay_router
from app.api.routes.admin import router as admin_router

import os

app = FastAPI(title="Statis API")

frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3001")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        frontend_url,
        "http://localhost:3000",
        "http://localhost:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(events_router)
app.include_router(state_router)
app.include_router(subscriptions_router)
app.include_router(deliveries_router)
app.include_router(replay_router)
app.include_router(admin_router)


@app.get("/health")
def health() -> dict[str, bool]:
    return {"ok": True}
