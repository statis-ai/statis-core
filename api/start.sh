#!/usr/bin/env sh
# Start the API; use PORT from environment (Railway sets this).
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
