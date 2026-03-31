# Self-Hosting Statis

Run the full Statis stack (API, execution worker, PostgreSQL, Redis) on your own infrastructure.

## Prerequisites

- Docker 24+ and Docker Compose v2
- 2 GB RAM minimum (4 GB recommended for production)

## Quickstart

```bash
git clone https://github.com/statis-ai/statis-core.git
cd statis-core

cp .env.example .env
# Edit .env — set SECRET_KEY to a random 64-character string at minimum

docker compose up -d
```

Verify the API is up:

```bash
curl http://localhost:8000/health
# {"status": "ok"}
```

Run the database migrations:

```bash
docker compose exec api alembic upgrade head
```

Create your first API key:

```bash
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "you@example.com", "password": "your-password"}'
```

## Environment Variables

Copy `.env.example` to `.env` and fill in the following:

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://statis:changeme@db:5432/statis` |
| `REDIS_URL` | Redis connection string | `redis://redis:6379/0` |
| `SECRET_KEY` | JWT signing secret — change this | `change-me` |
| `CORS_ALLOWED_ORIGINS` | Comma-separated allowed origins | `https://console.statis.dev` |
| `FILESYSTEM_ADAPTER_ALLOWED_PREFIX` | Restrict FilesystemAdapter writes | `/tmp/statis` |
| `POSTGRES_PASSWORD` | Password for the `db` service | `changeme` |
| `POLL_INTERVAL` | Worker poll interval in seconds | `1` |
| `BATCH_SIZE` | Worker actions per poll cycle | `10` |

## Production Hardening

### 1. Change all secrets

Generate a strong SECRET_KEY:

```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

Set `POSTGRES_PASSWORD` to something other than `changeme`.

### 2. Enable TLS with Caddy

Add a `caddy` service to your `docker-compose.yml` override:

```yaml
services:
  caddy:
    image: caddy:2-alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddy_data:/data
    depends_on:
      - api
```

Example `Caddyfile`:

```
api.yourdomain.com {
    reverse_proxy api:8000
}
```

Caddy handles certificate issuance and renewal automatically.

### 3. Restrict the database port

In the `db` service, remove the `ports` block entirely. The API and worker reach the database via the internal Docker network (`db:5432`). Exposing port 5432 to the host is only needed for local development access.

### 4. Set CORS origins

Set `CORS_ALLOWED_ORIGINS` to only your console domain:

```
CORS_ALLOWED_ORIGINS=https://console.yourdomain.com
```

## Sandbox Reset (optional)

To run the sandbox environment with a daily reset, add a cron job on the host:

```
0 0 * * * docker compose -f /path/to/statis-core/docker-compose.yml exec -T api python scripts/seed_sandbox.py --reset
```

## SIEM Integration

Statis can forward receipt events to Datadog and Splunk on action completion. Both exporters are disabled by default and fire-and-forget — failures are logged but never block execution.

### Datadog

| Variable | Description | Default |
|----------|-------------|---------|
| `SIEM_DATADOG_ENABLED` | Enable Datadog log export | `false` |
| `SIEM_DATADOG_API_KEY` | Datadog API key | _(empty)_ |
| `SIEM_DATADOG_HOST` | Datadog HTTP intake host | `https://http-intake.logs.datadoghq.com` |

Logs are sent to `{SIEM_DATADOG_HOST}/api/v2/logs` with source `statis` and service `statis-receipts`.

### Splunk HEC

| Variable | Description | Default |
|----------|-------------|---------|
| `SIEM_SPLUNK_ENABLED` | Enable Splunk HEC export | `false` |
| `SIEM_SPLUNK_HEC_URL` | Splunk HEC endpoint (e.g. `https://splunk.corp.com:8088`) | _(empty)_ |
| `SIEM_SPLUNK_HEC_TOKEN` | Splunk HEC token | _(empty)_ |

Events are sent to `{SIEM_SPLUNK_HEC_URL}/services/collector/event` with sourcetype `statis:receipt`.

### Event payload

Each SIEM event contains: `timestamp`, `service`, `tenant_id`, `action_id`, `action_type`, `target_system`, `decision`, `status`, `receipt_id`, `receipt_hash`, `mode`.

---

## Updating

```bash
git pull
docker compose build
docker compose up -d
docker compose exec api alembic upgrade head
```
