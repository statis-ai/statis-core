# Testing

## Framework

### Test Runner
- **Framework**: pytest
- **Version constraints**: pytest >= 7.0 (from sdk/pyproject.toml)
- **Configuration**: `api/pytest.ini` with custom markers and testpaths

### Test Infrastructure
- **Database**: testcontainers[postgres] for container-based PostgreSQL
  - Automatically spins up a fresh postgres:16 container per test session
  - Database migrations run via Alembic before each test session
- **HTTP client**: FastAPI's `TestClient` (wraps httpx) for endpoint testing
- **HTTP mocking**: respx >= 0.20 for SDK tests (mocks httpx)
- **Async support**: pytest-asyncio for any async test fixtures (listed in sdk/pyproject.toml)

### Dependencies
```
fastapi
uvicorn
sqlalchemy
alembic
psycopg[binary]
pydantic
pytest
httpx
testcontainers[postgres]
respx (SDK only)
pytest-asyncio (SDK only)
```

## Structure

### Directory Layout
```
api/tests/
├── conftest.py              # Session and function-scoped fixtures
├── unit/
│   ├── conftest.py          # Unit test-specific fixtures (fake DB)
│   ├── test_*.py            # Pure unit tests (no DB, no testcontainers)
│   └── test_hashing.py, test_policy_evaluator.py, etc.
└── integration/
    ├── conftest.py          # Integration test setup (if any additional)
    ├── test_*.py            # Full integration tests with real DB
    └── test_event_ingestion.py, test_csm_demo_e2e.py, etc.

sdk/tests/
└── test_client.py           # SDK client unit tests with respx mocking
```

### Test File Naming
- Test files: `test_*.py`
- Test classes: `Test<Feature>` (e.g., `TestChurnRetentionRule`, `TestCsmDemoE2E`)
- Test methods/functions: `test_<scenario>` (e.g., `test_approved_when_all_conditions_met`)

### Test Discovery
- **Testpaths**: `api/pytest.ini` specifies `testpaths = tests`
- **Markers**: Custom marker `@pytest.mark.integration` for integration tests
- **Auto-discovery**: pytest finds all `test_*.py` files and `Test*` classes

## Test Types

### Unit Tests (149 tests in `/api/tests/unit/`)
- **No DB dependency**: Pure Python, deterministic, < 100ms per test
- **Purpose**: Test business logic in isolation
- **Examples**:
  - `test_policy_evaluator.py` — Policy decision logic (10 tests)
  - `test_receipt_hash.py` — SHA-256 canonical hashing (8 tests)
  - `test_reducers.py` — Pure reducer functions (20+ tests)
  - `test_hashing.py` — Hashing utility properties
  - `test_account_pack.py` — Account state reducer logic
  - `test_sandbox.py` — Reducer timeout/error wrapping
  - `test_event_validation.py` — Schema validation
  - `test_state_replay.py` — Time-machine logic
  - `test_batch_worker.py` — Batch processing logic
  - `test_golden_snapshot.py` — Snapshot-based tests
  - `test_*_adapter.py` — Individual adapter mocking (Zendesk, Salesforce, Airflow, HubSpot)
  - `test_enqueue_deliveries.py` — Delivery enqueueing logic

### Integration Tests (67 tests in `/api/tests/integration/`)
- **Real DB**: Testcontainers + live PostgreSQL
- **Full stack**: HTTP requests through TestClient to full app with real DB
- **Purpose**: Verify end-to-end workflows and cross-system interactions
- **Examples**:
  - `test_event_ingestion.py` — Event insertion, idempotency, ordering
  - `test_csm_demo_e2e.py` — Full CSM scenario: seed events → state → delivery records
  - `test_materialization.py` — State materialization and hashing
  - `test_account_pack.py` — Reducer application during event ingestion
  - `test_delivery_flow.py` — Webhook subscription and delivery
  - `test_subscriptions_api.py` — Subscription CRUD endpoints
  - `test_concurrency.py` — Concurrent event processing, isolation
  - `test_tenant_isolation.py` — RBAC-lite event/state filtering
  - `test_rbac.py` — Role-based visibility and redaction
  - `test_replay.py` — Time-machine queries with state at specific revisions
  - `test_time_machine.py` — GET /state/.../at?rev=N endpoint
  - `test_events_query.py` — Event querying with filters
  - `test_worker.py` — Execution worker behavior
  - `test_admin_api.py` — Admin endpoints (user management)

### SDK Tests
- **Framework**: respx mocking (not testcontainers)
- **Location**: `sdk/tests/test_client.py`
- **Purpose**: Verify SDK client behavior against mocked API responses
- **Pattern**: respx intercepts httpx calls; SDK makes calls expecting specific responses

## Mocking

### DB Mocking Strategy
- **Fixture override**: `app.dependency_overrides[get_db] = fake_db` for unit tests
- **Pattern**:
  ```python
  @pytest.fixture()
  def client():
      def _fake_db():
          yield object()  # Dummy, never accessed

      app.dependency_overrides[get_db] = _fake_db
      try:
          with TestClient(app) as test_client:
              yield test_client
      finally:
          app.dependency_overrides.clear()
  ```

### Real DB for Integration Tests
- **Session fixture**: `db_session` is a live SQLAlchemy session connected to testcontainers postgres
- **Truncation**: Tables are truncated before each test (deliveries, subscriptions, entity_state, events, api_keys, quarantine)
- **API key seeding**: Test fixtures create three API keys (`TEST_KEY_TENANT1`, `TEST_KEY_TENANT2`, `TEST_KEY_BILLING`) for multi-tenant testing

### HTTP Mocking (SDK Tests)
- **Tool**: respx library intercepts httpx requests
- **Pattern**:
  ```python
  @respx.mock
  def test_propose_returns_action_id():
      respx.post(f"{BASE}/actions").mock(return_value=Response(201, json=ACTION_PROPOSED))
      with StatisClient(api_key="test-key") as client:
          aid = client.propose(...)
      assert aid == "act-1"
  ```

### Reducer Testing (No Mocking)
- Pure functions tested directly with `SimpleNamespace` objects to avoid mocking
- Example: `_action()` helper returns a SimpleNamespace with `action_type` attribute

### External Adapter Mocking
- **Adapters**: MockStripeAdapter, AirflowAdapter, SalesforceAdapter, ZendeskAdapter, HubSpotAdapter
- **Pattern**: Abstract base `BaseAdapter` defines `execute(action) -> ExecutionResult`
- **MockStripeAdapter**: Built-in fake implementation with 50ms simulated latency (for local testing)

## Running Tests

### All Tests
```bash
# From api/ directory
pytest
```

### Unit Tests Only
```bash
pytest tests/unit
pytest -m "not integration"
```

### Integration Tests Only
```bash
pytest tests/integration
pytest -m integration
```

### Specific Test File
```bash
pytest tests/unit/test_policy_evaluator.py
pytest tests/integration/test_csm_demo_e2e.py
```

### Specific Test Class/Method
```bash
pytest tests/unit/test_policy_evaluator.py::TestChurnRetentionRule::test_approved_when_all_conditions_met
```

### Verbose Output
```bash
pytest -v                    # Show test names
pytest -vv                   # Even more verbose
pytest -s                    # Show print() statements (prevent output capture)
```

### Exit on First Failure
```bash
pytest -x                    # Stop at first failure
pytest --tb=short            # Shorter traceback format
```

### With Coverage (if pytest-cov installed)
```bash
pytest --cov=app --cov-report=html   # Generate HTML coverage report
```

### SDK Tests (from sdk/ directory)
```bash
cd sdk
pip install -e ".[dev]"      # Install with dev dependencies
pytest tests/
```

## Coverage

### No Explicit Coverage Requirement
- No `pytest.ini` coverage threshold configuration found
- No `.coveragerc` file in repository
- Coverage is implicitly monitored but not enforced

### Coverage Approach (Inferred)
- **Unit tests**: High coverage of pure functions (policy evaluator, reducers, hashing)
- **Integration tests**: End-to-end coverage of workflows and edge cases
- **Example coverage**:
  - Policy evaluator: 10 tests covering all decision paths
  - Reducers: 20+ tests covering state transitions
  - Receipt hashing: 8 tests covering determinism and edge cases
  - E2E: 67 integration tests covering full workflows

### Test Count Summary
- **Total unit tests**: 149 (10 files in `tests/unit/`)
- **Total integration tests**: 67 (13 files in `tests/integration/`)
- **Total SDK tests**: ~50+ (single file `sdk/tests/test_client.py`)
- **Grand total**: 250+ tests across the codebase

## Fixture Reference

### Session-Scoped Fixtures (Shared Across Tests)
```python
postgres_url          # Testcontainer PostgreSQL connection string
migrated_postgres_url # Same as above, after Alembic migration
```

### Function-Scoped Fixtures (Per Test)
```python
db_session            # Live SQLAlchemy session, tables truncated before test
client                # TestClient authenticated as TEST_KEY_TENANT1 (admin)
client_tenant2        # TestClient authenticated as TEST_KEY_TENANT2
client_billing        # TestClient as TEST_KEY_TENANT1 with role=billing
```

### Unit Test Fixtures
```python
client                # Fake DB override (no real postgres needed)
```

### Test Constants
```python
TEST_KEY_TENANT1      # "test_key_123"
TEST_KEY_TENANT2      # "test_key_tenant2"
TEST_KEY_BILLING      # "test_key_billing" (role=billing, agent_id=billing_agent)
```

## Test Patterns & Best Practices

### Arrange-Act-Assert
Tests follow clear structure:
```python
def test_approved_when_all_conditions_met():
    # Arrange
    entity_state = {"churn_risk": True, "ltv": 1200}

    # Act
    decision = evaluator.evaluate(
        action=_action(),
        entity_state=entity_state,
        event_history=[],
        rules=[CHURN_RETENTION_RULE]
    )

    # Assert
    assert decision.decision == "APPROVED"
```

### Descriptive Test Names
- Names describe the scenario and expected outcome
- Examples: `test_denied_when_churn_risk_low`, `test_approved_when_old_discount_outside_window`

### Deterministic Tests
- No time-dependent assertions (except explicit datetime checks)
- No randomness or ordering assumptions
- Fixtures provide consistent seed data

### Isolation
- Each test is independent; no test order assumptions
- DB cleanup (truncation) ensures clean state per test
- Dependency overrides cleared in finally blocks

### Helper Functions
- `_event()`, `_action()` helpers create test objects concisely
- `_canonical()` helper builds test receipt data
- Reduces boilerplate in test functions

### Edge Cases & Boundaries
- Tests cover happy path, error cases, and edge boundaries
- Examples: empty state, null rule_id, very old discounts, missing context keys

## Debugging Tests

### Common Issues
- **IntegrityError**: Duplicate key; check test isolation and DB truncation
- **Timeout**: testcontainers postgres slow to start; increase timeout in CI
- **401/403**: Wrong API key; verify fixture keys match test expectations
- **State mismatch**: Reducer not applied; verify event_type has registered reducer

### Tips
- Run single test first to isolate: `pytest tests/unit/test_policy_evaluator.py::TestChurnRetentionRule::test_approved_when_all_conditions_met`
- Use `-s` flag to see print() output
- Check `conftest.py` for fixture setup
- Verify DB state with `db_session.execute(text("SELECT ..."))` in tests
