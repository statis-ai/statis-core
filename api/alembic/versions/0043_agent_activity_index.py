"""spine: composite index for per-agent activity lookups

Revision ID: 0043
Revises: 0042
Create Date: 2026-04-25

Composite index on (tenant_id, proposed_by, decided_at). Powers two reads:

  1. Approval page identity-card stats — "14 actions today / 0 denied" —
     fetched as `WHERE tenant_id=? AND proposed_by=? AND decided_at >= ?`.
  2. Operator console agent timelines.

`proposed_by` is the canonical agent identifier on `action_contracts` (see
0036_aarm_r6_identity_binding). `decided_at` was added in 0040.

Plan reference: P1 (composite index from /plan-design-review).
"""

from alembic import op


revision = "0043"
down_revision = "0042"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_index(
        "ix_action_contracts_agent_activity",
        "action_contracts",
        ["tenant_id", "proposed_by", "decided_at"],
    )


def downgrade() -> None:
    op.drop_index("ix_action_contracts_agent_activity", table_name="action_contracts")
