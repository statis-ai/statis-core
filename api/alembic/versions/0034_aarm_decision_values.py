"""aarm r4: expand decision vocabulary to STEP_UP, DEFERRED, MODIFIED

Revision ID: 0034_aarm_decision_values
Revises: 0032_merge_kill_switch_branch
Create Date: 2026-04-19 00:00:00.000000

PR-AARM-01 — Decision Enum Expansion.

Introduces the AARM R4 canonical decision vocabulary at the application
layer: STEP_UP, DEFERRED, MODIFIED, in addition to the legacy APPROVED /
DENIED / ESCALATED values.

This migration is intentionally a no-op at the schema level:

  * action_contracts.status is a String column (not a PG ENUM type), so no
    ALTER TYPE is required. Any string value is accepted at the DB level;
    validation lives in app.schemas.actions.ActionStatus.
  * Existing ESCALATED values on in-flight actions are preserved and treated
    as semantic aliases for STEP_UP (see schemas/actions.py normalize()).
  * No policy rules are reseeded. New DEFERRED / MODIFIED rules can be
    authored via POST /policy-rules after this migration lands.

The migration exists to:
  * Bump the alembic head so deployments roll forward cleanly.
  * Mark the first `aarm/*` schema checkpoint for future tooling to identify
    AARM-related migrations (PR-02 Ed25519 receipts will add the first
    non-trivial schema change in 0035).
"""

revision = "0034_aarm_decision_values"
down_revision = "0032_merge_kill_switch_branch"
branch_labels = None
depends_on = None


def upgrade() -> None:
    """No schema change. See module docstring."""
    pass


def downgrade() -> None:
    """No schema change. See module docstring."""
    pass
