# Conventions

## Code Style

### Python Code Formatting
- **Formatter**: No explicit linter config found (pytest.ini, no .flake8 or .pylintrc)
- **Import style**: Standard library imports first, then third-party, then local (implicit)
- **Type hints**: Full type hints throughout, using `from __future__ import annotations` for forward references
- **String quotes**: Double quotes preferred
- **Line length**: Appears to follow 100-120 character implicit limit (observed in most files)
- **Indentation**: 4 spaces throughout

### Docstring Style
- **Format**: Google-style docstrings with triple double-quotes (`"""`)
- **Module docstrings**: Comprehensive, multi-line with clear purpose and usage examples
- **Function docstrings**: Concise one-liners to multi-line with description, args, returns, raises (when needed)
- **Dataclass docstrings**: Brief descriptions of purpose and usage patterns
- **Comment style**: Inline comments start with `#` (single space after); section separators use `# ─ ... ─` pattern with markdown-like visual dividers

### Examples
```python
# Module-level docstring
"""Reducer sandboxing: timeout protection and error wrapping for reducer execution."""

# Function docstring
def compute_state_at_rev(
    events: List[Event], target_rev: int
) -> Tuple[dict, str, List[str]]:
    """Replay *events* through reducers, stopping after *target_rev* state-changing events.

    Returns ``(state, state_hash, provenance_event_ids)`` at that revision.

    Raises ``ValueError`` if *target_rev* < 1 or if fewer than *target_rev*
    state-changing events are found in *events*.
    """
```

## Naming

### Variables & Functions
- **snake_case**: All function and variable names use snake_case (`insert_event_idempotent`, `get_reducer`)
- **Private prefix**: Leading underscore for internal/helper functions (`_payload`, `_check`, `_is_unrestricted`)
- **Boolean prefix**: `is_`, `has_`, `should_` prefixes for boolean functions (`_is_quarantined`, `has_reducer`, `should_apply`)
- **Prefix patterns**: Getter patterns with `get_` and `_get_` for dependencies and internal getters

### Classes & Models
- **PascalCase**: All classes use PascalCase (`PolicyEvaluator`, `EventIn`, `ActionContract`)
- **Enum-like suffixes**: Schema classes end with `In`/`Out` for API contracts (`EventIn`, `EventOut`, `ActionAccepted`)
- **Model suffix**: DB models typically named directly without suffix (`Event`, `ActionContract`, `Receipt`)
- **Exception suffix**: Custom exceptions end with `Error` (`ReducerError`, `ReducerTimeoutError`, `StatisError`)

### Files & Modules
- **snake_case**: Module files use snake_case (`state_replay.py`, `policy_evaluator.py`, `action_contract.py`)
- **Location**: Models in `models/`, schemas in `schemas/`, routes in `api/routes/`, adapters in `adapters/`
- **Test naming**: Test files follow `test_*.py` convention

### Constants
- **UPPER_CASE**: Registry keys and environment-driven constants are uppercase
- **Implicit constants**: Magic numbers and thresholds are defined as module-level constants (`MAX_MATERIALIZE_RETRIES = 5`, `QUARANTINE_THRESHOLD = 3`)

## Patterns

### Pure Functions & Reducers
- **Core pattern**: Reducer functions are pure — `(state: dict, event: Any) -> dict`
  - No side effects, no randomness, no time-dependent logic
  - Input state is never mutated; new state is returned
  - Deterministic output for same input (testable in isolation)
- **Signature**: `reduce_<event_type>(state: dict, event: Any) -> dict`
- **Example**: `reduce_ticket_updated(state, event)` in `api/app/reducers/account.py`

### Dataclass Use
- **Frozen dataclasses**: `@dataclass(frozen=True)` for immutable value objects
- **Used for**: Policy rules (`RuleSpec`), decisions (`PolicyDecision`), execution results (`ExecutionResult`)
- **No inheritance**: Dataclasses used as DTOs, not as base classes

### Repository Pattern
- **Separation**: Repositories (`api/app/repositories/`) handle all DB I/O
- **Functions over classes**: Repository modules export pure functions, not ORM models
- **Examples**: `insert_event_idempotent()`, `compute_state_at_rev()` are pure wrappers over DB queries

### Dependency Injection (FastAPI)
- **Route handlers**: Use `Depends()` for DB sessions, auth context, and configuration
- **Fixtures in tests**: Override `app.dependency_overrides[get_db]` to inject test DB
- **Pattern**: Database session is always a dependency, never instantiated in handlers

### API Routes
- **Structure**: Router files in `api/routes/` define endpoints using FastAPI decorator syntax
- **Naming**: Functions are verb-based (e.g., `ingest_event`, `propose_action`, `get_action`)
- **Response models**: All endpoints specify `response_model=SomeSchema` for validation and documentation
- **Status codes**: Use `status.HTTP_*` constants from fastapi
- **Error handling**: Raise `HTTPException` with status code and detail message for client errors

### ORM Models
- **SQLAlchemy 2.0 style**: Use `Mapped[]` type annotations and `mapped_column()` for columns
- **Defaults**: Server defaults use `server_default=func.now()` for timestamps
- **JSON columns**: JSONB type for nested data (not TEXT or JSON)
- **Indexes**: `__table_args__` tuple for indexes: `Index("ix_...", col1, col2)`
- **PKs & UKs**: Primary keys explicit; unique constraints via `unique=True` parameter

### Schema/Model Distinction
- **Pydantic schemas** (`schemas/`): For API contracts, validation, serialization
  - `In` suffix for request bodies
  - `Out` suffix for response bodies
  - `ConfigDict(from_attributes=True)` for ORM mapping
- **SQLAlchemy models** (`models/`): Database representation only
  - Never used directly in API responses; always wrapped in a schema

### Error Handling Patterns
- **Custom exceptions**: Create domain-specific exceptions (e.g., `ReducerError`, `ReducerTimeoutError`)
- **Wrapping**: Low-level errors (e.g., `IntegrityError`, timeouts) are wrapped in domain exceptions
- **Re-raising**: Use `raise ... from exc` to preserve stack traces
- **HTTP exceptions**: Raise `HTTPException` with status code and detail in route handlers
- **Logging**: Use `logger.warning()` or `logger.error()` for exceptional conditions (e.g., quarantine events)

### Testing Patterns
- **Fixture scope**: Fixtures use appropriate scope (`session`, `function`)
- **Cleanup**: Explicit cleanup via `finally` blocks or fixture generators with `yield`
- **Dependency override**: Override FastAPI dependencies for isolated testing
- **Named fixtures**: Fixture names are descriptive (`db_session`, `client`, `client_tenant2`, `client_billing`)

### Validation
- **Input validation**: Pydantic handles schema validation automatically
- **Business logic validation**: Explicit checks in repositories or services (e.g., `if target_rev < 1: raise ValueError(...)`)
- **Error messages**: Messages are descriptive and include context (e.g., `f"target_rev must be >= 1, got {target_rev}"`)

## Error Handling

### Exception Types
- **Custom exceptions**: Define at module level (e.g., `class ReducerError(Exception)`)
- **Domain specificity**: `ReducerError`, `ReducerTimeoutError`, `ReducerOutputInvalid` for reducer failures
- **HTTP layer**: `HTTPException` from FastAPI with status codes and detail messages
- **SQL layer**: Catch `IntegrityError` from SQLAlchemy for duplicate keys, constraints

### Raising Conventions
- **With context**: Always include context in error messages using f-strings
- **With cause**: Use `raise NewError(...) from original_exc` to preserve traceback
- **Example**:
  ```python
  except IntegrityError:
      db.rollback()
      raise HTTPException(
          status_code=status.HTTP_409_CONFLICT,
          detail=f"Action '{action_in.action_id}' already exists"
      )
  ```

### Recovery Patterns
- **Isolation**: Errors in one entity (e.g., a reducer failure) don't affect others
- **Quarantine**: Entities with repeated failures are quarantined; polling skips them
- **Retry**: Worker uses exponential backoff; delivery uses SKIP LOCKED to avoid contention
- **Idempotency**: Actions and deliveries use idempotency keys to allow safe retry

### Logging
- **Level**: Use `logger.warning()` for expected failures (e.g., quarantine), `logger.error()` for unexpected
- **Context**: Always include relevant IDs (tenant_id, entity_id, action_id, etc.) in log messages
- **Format**: `logging.basicConfig()` sets format to: `"%(asctime)s %(levelname)s %(name)s: %(message)s"`

## Comments & Docs

### Inline Comments
- **Spacing**: Single space after `#` (e.g., `# This is a comment`)
- **Purpose**: Explain *why*, not *what* (code is self-documenting)
- **Section dividers**: Use visual ASCII art: `# ─ section name ─────────────────────────────────`

### Module Docstrings
- **Placement**: At the top of file, before imports
- **Content**: Purpose, key concepts, usage examples, caveats
- **Example**:
  ```python
  """Append-only event log with idempotent ingestion and deterministic ordering.

  Events are inserted only if event_id is novel; ordering is always by
  (occurred_at ASC, ingested_at ASC, event_id ASC).
  """
  ```

### Function & Class Docstrings
- **Format**: One-line summary, blank line, detailed description if needed
- **Args/Returns/Raises**: Use `Args:`, `Returns:`, `Raises:` sections (not NumPy/Sphinx-style)
- **Example**:
  ```python
  def evaluate(self, action: Any, entity_state: dict, event_history: list, rules: list) -> PolicyDecision:
      """Evaluate an action against a set of policy rules.

      Returns the highest-priority matching rule's decision, or DENIED if no rules match.
      """
  ```

### Type Hints in Docstrings
- **Primary source**: Type hints are in function signatures, not repeated in docstrings
- **Complex types**: May be described in docstring if unclear (e.g., "list of event-like objects with event_type and occurred_at")

### Configuration Defaults
- **Environment variables**: Used for deployment config (DATABASE_URL, POLL_INTERVAL, BATCH_SIZE)
- **Hardcoded defaults**: Reasonable defaults in code for development (e.g., POLL_INTERVAL = 1s default)
- **Documentation**: Config options documented in module/class docstrings
