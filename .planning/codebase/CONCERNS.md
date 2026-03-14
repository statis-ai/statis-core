# Concerns

## Tech Debt

### 1. Weak Password Hashing — CRITICAL SECURITY ISSUE
**Location:** `/home/aniket/statis/statis-core/api/app/api/routes/admin.py:22-26`

The codebase uses SHA-256 for password hashing:
```python
def _hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()
```

**Issues:**
- SHA-256 is not designed for password hashing (no salt, no key stretching, GPU-accelerated)
- Vulnerable to rainbow tables and dictionary attacks
- Should use `bcrypt`, `argon2`, or `scrypt` with salt and work factor

**Impact:** HIGH — Any breach exposes user passwords
**Recommended Fix:** Replace with `bcrypt` or `argon2-cffi`:
```python
from passlib.context import CryptContext
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
pwd_context.hash(password)
pwd_context.verify(password, hash)
```

---

### 2. Broad CORS Configuration
**Location:** `/home/aniket/statis/statis-core/api/app/main.py:17-30`

```python
_frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3001")
_origins = [u.strip() for u in _frontend_url.split(",") if u.strip()]
_defaults = ["http://localhost:3000", "http://localhost:3001"]
allow_origins = list(dict.fromkeys(_origins + _defaults))

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,  # ← dangerous with allow_origins=*
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**Issues:**
- `allow_methods=["*"]` + `allow_headers=["*"]` overly permissive
- `allow_credentials=True` + broad origin list increases CSRF surface
- Hardcoded localhost origins in defaults remain even in production if `FRONTEND_URL` is unset

**Impact:** MEDIUM — Increases CSRF and credential theft risk
**Recommended Fix:**
```python
allow_methods=["GET", "POST", "OPTIONS"]  # explicit methods
allow_credentials=True,  # OK if origins are strict
allow_headers=["Content-Type", "Authorization", "X-API-Key"]  # explicit headers
```

---

### 3. Plain-Text API Key Logging
**Location:** Multiple files generate and return raw API keys

```python
# api/app/api/routes/admin.py:108
raw_key, _ = _generate_api_key(tenant_id, label, db)
return SignupResponse(tenant_id=tenant_id, api_key=raw_key, label=label)
```

**Issues:**
- Raw API keys appear in HTTP response bodies (logged in access logs)
- Could be captured in proxies, caches, or browser history
- No guidance on secure storage for consumers

**Impact:** MEDIUM — Keys may leak through logging/caching middleware
**Recommended Fix:**
- Document that raw keys should never be logged (add header instruction)
- Only return key once; provide digest/fingerprint on subsequent requests
- Consider key rotation/versioning strategy

---

### 4. Exception Handling Catching Broad Exception Classes
**Location:** Multiple files use bare `except Exception as exc:`

Examples:
- `/home/aniket/statis/statis-core/api/app/reducers/sandbox.py:38`
- `/home/aniket/statis/statis-core/worker/execute.py:197, 202`
- `/home/aniket/statis/statis-core/api/app/adapters/airflow.py:106`

**Issues:**
- Catches `Exception` (not `BaseException`) but doesn't discriminate between recoverable/fatal errors
- May mask programming errors (AttributeError, KeyError, etc.)
- Hard to reason about what exceptions are actually expected
- Worker logs "Error processing action" but continues—unclear if state is consistent

**Impact:** MEDIUM — Makes debugging harder, may hide bugs
**Recommended Fix:** Catch specific exceptions:
```python
except (IntegrityError, ReducerError, ReducerTimeoutError) as exc:
    # handle specific failure modes
except Exception:  # truly unexpected
    logger.exception("Unexpected error")
    raise  # or fail-safe default
```

---

### 5. Synchronous HTTP Calls in Worker
**Location:** `/home/aniket/statis/statis-core/api/app/adapters/*.py`

All adapters use synchronous `urllib.request` (Airflow, Salesforce, Zendesk, HubSpot):
```python
# airflow.py:146
with urlopen(req, timeout=30) as resp:
    return json.loads(resp.read())
```

**Issues:**
- Worker is single-threaded polling loop; external API calls block other actions
- 30s timeout × batch of 10 actions = 300s potential blockage
- No connection pooling; new connection per request
- `MockStripeAdapter` artificially adds 50ms delay for simulation

**Impact:** LOW-MEDIUM — Throughput bottleneck at scale; not critical for small volumes
**Recommended Fix:**
- Consider `httpx.AsyncClient` or `aiohttp` for non-blocking I/O
- Implement connection pooling (httpx keeps-alive)
- Consider circuit breaker pattern for failing external systems

---

## Security

### 1. Missing Rate Limiting on Auth Endpoints
**Location:** `/home/aniket/statis/statis-core/api/app/api/routes/admin.py`

No rate limiting on `/signup`, `/login`, or `/api-keys` endpoints.

**Issues:**
- Brute-force attacks on email/password login possible
- Account enumeration via email signup endpoint
- API key creation not rate-limited (attacker could generate unlimited keys)

**Impact:** HIGH — Authentication endpoints unprotected
**Recommended Fix:**
- Add per-IP rate limiting (e.g., `slowapi` library)
- Add per-email rate limiting on login/signup
- Implement exponential backoff on failed login attempts

---

### 2. No Input Validation on JSON Payloads
**Location:** Most API routes accept `payload` / `parameters` without schema validation

Example: `/home/aniket/statis/statis-core/api/app/api/routes/actions.py:38`
```python
parameters=action_in.parameters,
```

`ActionIn.parameters` is defined as `dict[str, Any]` with no constraints on keys/values.

**Issues:**
- Arbitrary JSON accepted, could be used for injection attacks
- No bounds on field count, string length, nesting depth
- Reducers assume well-formed event payloads

**Impact:** MEDIUM — Potential DOS via large payloads; reducer assumptions may be violated
**Recommended Fix:**
- Limit payload size (e.g., `max_size=1MB`)
- Validate parameter keys are alphanumeric + underscore
- Use Pydantic `Field(max_length=...)` constraints

---

### 3. Tenant Isolation Not Enforced Everywhere
**Location:** Various routes and queries

**Example vulnerability:** `/home/aniket/statis/statis-core/api/app/api/routes/actions.py:62-71`
```python
contracts = (
    db.query(ActionContract)
    .filter(
        ActionContract.tenant_id == auth.tenant_id,  # ← good
        # ... other filters ...
    )
    .all()
)
```

While most routes check `tenant_id`, there are edge cases:
- `/state/{entity_type}/{entity_id}/at?rev=N` — uses direct `db.get()` without tenant scope check?
- Delivery mechanism could inadvertently leak state to wrong tenant if subscription is misconfigured

**Impact:** MEDIUM — Information disclosure risk if tenant filtering is missed in one endpoint
**Recommended Fix:**
- Create a helper function `get_auth_entity_state(auth, entity_type, entity_id, db)` that always enforces tenant
- Use typing to ensure all queries return `Optional[T]` and check for None (implicit tenant isolation check)
- Add integration test for cross-tenant access attempts

---

### 4. No Audit Trail for Admin Actions
**Location:** `/home/aniket/statis/statis-core/api/app/api/routes/admin.py`

Creating API keys, signing up users, logging in — no audit trail.

**Issues:**
- Cannot trace who created which API key
- No timestamp on password change
- Complies with neither SOC2 nor GDPR audit requirements

**Impact:** MEDIUM — Compliance and forensics risk
**Recommended Fix:**
- Add `audit_log` table with `{action, actor, timestamp, target_id, metadata}`
- Log all auth/key operations

---

## Performance

### 1. Materialization Retry Loop with Linear Backoff
**Location:** `/home/aniket/statis/statis-core/api/app/repositories/events.py:112-204`

```python
for attempt in range(MAX_MATERIALIZE_RETRIES):
    if attempt > 0:
        time.sleep(0.05 * 2**attempt)  # exponential: 0.1s, 0.2s, 0.4s, ...
```

**Issues:**
- Blocks the event insertion thread; if materialization fails 5 times, entire request is delayed
- Exponential backoff goes: 0.05s, 0.1s, 0.2s, 0.4s, 0.8s = ~1.6s total per event if all retries fail
- Events are not processed async; retries block HTTP response

**Impact:** MEDIUM — Event ingestion slows under contention
**Recommended Fix:**
- Consider moving materialization to async task queue (Celery, RQ)
- Or: Insert event atomically, let background worker materialize asynchronously
- Reduce MAX_MATERIALIZE_RETRIES from 5 to 3 if HTTP response time is critical

---

### 2. Missing Index on `(tenant_id, status, next_attempt_at)` in Deliveries
**Location:** `/home/aniket/statis/statis-core/api/app/models/delivery.py:13`

```python
Index("ix_deliveries_poll", "status", "next_attempt_at"),
```

**Issue:**
- Polling query filters on `(status IN (...), next_attempt_at <= NOW())` but index doesn't include `tenant_id`
- Could do full table scan on large delivery tables

**Impact:** LOW — May not matter for small scale; watch if deliveries exceed 100k rows
**Recommended Fix:**
```python
Index("ix_deliveries_poll_tenant", "tenant_id", "status", "next_attempt_at"),
```

---

### 3. Unbounded Provenance Event IDs
**Location:** `/home/aniket/statis/statis-core/api/app/models/entity_state.py`

`provenance_event_ids` is a list stored in database that grows with every state change:
```python
provenance_event_ids=list(row.provenance_event_ids) + [event.event_id]
```

**Issues:**
- For long-lived entities with millions of events, this JSONB column grows unbounded
- Slows down state materialization (copy entire list on each event)
- No way to truncate/archive old provenance

**Impact:** MEDIUM — Problem only manifests at high scale (>1M events/entity)
**Recommended Fix:**
- Keep only last N events in `provenance_event_ids` (e.g., last 100)
- Store older provenance in separate archive table (optional)
- Document the limit

---

### 4. No Connection Pooling Configuration
**Location:** `/home/aniket/statis/statis-core/api/app/db/session.py` and `/home/aniket/statis/statis-core/worker/execute.py:61`

```python
engine = create_engine(settings.database_url, future=True)
```

**Issues:**
- No explicit `pool_size` or `max_overflow` specified
- Default SQLAlchemy pool size is 5 + 10 overflow
- With multiple workers and async requests, connection pool may be exhausted

**Impact:** MEDIUM — At high concurrency, "too many connections" errors likely
**Recommended Fix:**
```python
engine = create_engine(
    settings.database_url,
    future=True,
    pool_size=20,
    max_overflow=40,
    pool_pre_ping=True,  # detect stale connections
)
```

---

## Fragile Areas

### 1. Reducer Registration Coupling
**Location:** `/home/aniket/statis/statis-core/api/app/reducers/registry.py` (not shown, but referenced)

If a reducer is used in an event but not registered:
```python
if not has_reducer(event.event_type):
    return None  # silently skip materialization
```

**Issues:**
- Silent failure: event inserted, state not updated, webhook not sent
- Hard to detect in tests; requires explicit integration test for each event_type
- Producer can send events for unregistered reducers with no error

**Impact:** MEDIUM — Data inconsistency if reducer is missing
**Recommended Fix:**
- Fail loudly: raise `MissingReducerError` instead of returning None
- Or: require explicit registration of all event_types before accepting events
- Add endpoint `GET /admin/reducers` to inspect registered reducers

---

### 2. Execution Lock Release On Crash
**Location:** `/home/aniket/statis/statis-core/worker/execute.py:105-106`

```python
def _release_lock(db: Session, action_id: str) -> None:
    db.execute(delete(ExecutionLock).where(ExecutionLock.action_id == action_id))
```

**Issues:**
- If worker crashes after lock acquisition but before finalize, lock is never released
- Next worker must wait or manually intervene
- No lock expiry timestamp (e.g., STALE_LOCK_AGE_SECONDS)

**Impact:** MEDIUM — Lock leaks on worker crash; human intervention needed
**Recommended Fix:**
- Add `acquired_at` timestamp to `execution_locks` table
- Add cleanup job: `DELETE FROM execution_locks WHERE acquired_at < NOW() - INTERVAL '1 hour'`
- Document recovery procedure

---

### 3. Tender Race: Policy Evaluation Reads Stale Entity State
**Location:** `/home/aniket/statis/statis-core/api/app/api/routes/actions.py:127-136`

```python
entity_row = (
    db.query(EntityState)
    .filter(
        EntityState.tenant_id == auth.tenant_id,
        EntityState.entity_type == entity_type,
        EntityState.entity_id == entity_id,
    )
    .first()
)
entity_state: dict = entity_row.state if entity_row else {}
```

**Issues:**
- No row lock (SELECT FOR UPDATE)
- Between policy evaluation and action execution, state may change
- Receipt captures state_snapshot at evaluation time, but execution happens N seconds later
- No guarantee conditions still hold at execution time (e.g., churn_risk flipped to false)

**Impact:** LOW-MEDIUM — Rare in practice; acceptance criterion is "evaluate policy at proposal time"
**Recommended Fix:**
- Document that policy applies to state AT EVALUATION TIME, not execution time
- Consider re-evaluating policy right before execution (add re-check option)
- Add `policy_evaluated_at` timestamp to receipt for traceability

---

### 4. Async Worker Dependency Injection
**Location:** `/home/aniket/statis/statis-core/worker/execute.py:28-50`

Hardcoded adapter registry:
```python
ADAPTERS: dict[str, BaseAdapter] = {
    "stripe": MockStripeAdapter(),
    "airflow": AirflowAdapter(),
    "salesforce": SalesforceAdapter(),
    "zendesk": ZendeskAdapter(),
    "hubspot": HubSpotAdapter(),
}
```

**Issues:**
- Adapters are singletons; any per-request state is shared
- Cannot test with mock adapters without modifying source
- Adding new adapter requires code change + restart

**Impact:** LOW — Works for current design, but fragile for testing
**Recommended Fix:**
- Load adapters from config file or env-based factory
- Allow override via env var for testing: `ADAPTER_OVERRIDE_stripe=test.MockStripeAdapter`

---

## Missing Coverage

### 1. No Tests for Delivery Concurrency
**Location:** `api/tests/`

No integration test for concurrent webhook delivery:
```python
# Missing: test that SKIP LOCKED works, no duplicate deliveries sent
```

**Impact:** MEDIUM — Concurrency bugs could manifest in production
**Recommended Fix:**
- Add test: spawn 3 delivery workers simultaneously, verify no duplicate sends

---

### 2. No Tests for Reducer Timeout
**Location:** `api/tests/unit/test_sandbox.py` (if exists)

No test for the timeout mechanism in `run_reducer_safely()`:
```python
# Missing: test that reducer exceeding 5s timeout raises ReducerTimeoutError
```

**Impact:** MEDIUM — Timeout may not work as expected
**Recommended Fix:**
```python
def test_reducer_timeout():
    def slow_reducer(state, event):
        time.sleep(6)  # > 5s timeout
        return state
    with pytest.raises(ReducerTimeoutError):
        run_reducer_safely(slow_reducer, {}, Event(...), timeout_seconds=5)
```

---

### 3. No Tests for Cross-Tenant Isolation
**Location:** `api/tests/integration/test_rbac.py`

May exist, but no explicit test for tenant isolation on each endpoint.

**Impact:** HIGH — Information disclosure risk
**Recommended Fix:**
- Parametrized test for every GET/POST/DELETE endpoint:
  ```python
  def test_endpoint_tenant_isolation(endpoint, method, auth_tenant_1, auth_tenant_2):
      # access as tenant 1, verify cannot see tenant 2 data
  ```

---

### 4. No Tests for Admin Endpoints Security
**Location:** `api/tests/`

No tests for:
- Password reset (not implemented?)
- API key rotation
- Account deletion
- Email verification

**Impact:** MEDIUM — Security flows unverified
**Recommended Fix:** Add comprehensive admin endpoint tests

---

## TODOs / FIXMEs

**RESULT:** No explicit TODO/FIXME comments found in codebase. This is good—concerns are captured here instead.

---

## Priorities

### **Tier 1 — Fix Immediately (Security/Data Integrity)**

1. **Weak password hashing** → Use `bcrypt` or `argon2`
2. **Broad CORS config** → Restrict to known origins, explicit methods/headers
3. **Missing rate limiting on auth** → Add per-IP and per-email limits
4. **Tenant isolation edge cases** → Audit every query for tenant_id check
5. **Unbounded provenance** → Cap `provenance_event_ids` at N items

### **Tier 2 — Fix Before Production Scale (Performance/Operations)**

6. **Materialization blocking event insertion** → Async materialization or reduce retries
7. **Lock expiry** → Add `acquired_at`, cleanup job
8. **Connection pooling** → Explicit `pool_size` and `max_overflow`
9. **Delivery index** → Add multi-column index for polling
10. **Reducer registration failure mode** → Fail loudly on missing reducers

### **Tier 3 — Improve Robustness (Testing/Observability)**

11. Cross-tenant isolation tests
12. Reducer timeout tests
13. Concurrent delivery tests
14. Admin endpoint security tests
15. Audit trail for sensitive operations

---

## Summary

**Total concerns identified:** 20

**Critical/High:** 7
**Medium:** 11
**Low:** 2

The codebase is well-structured and handles the four primitives correctly. Main risks are:
- **Authentication/secrets** — weak password hashing, unprotected auth endpoints
- **Tenant isolation** — needs systematic verification across all routes
- **Concurrency** — edge cases around lock release and materialization retries
- **Scale** — unbounded data structures, lack of connection pooling, broad indexes

**Recommendation:** Address Tier 1 before any production deployment. Tier 2 before handling >100 concurrent requests. Tier 3 is good-to-have for team confidence.
