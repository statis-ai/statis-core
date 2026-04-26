"""spine: canonical_args_hash + decided_at + graduation lookup index

Revision ID: 0040
Revises: 0039
Create Date: 2026-04-25

Two new columns on action_contracts and one composite index. All three are
required by the Trojan-horse policy graduation mechanic (premise 4): we need
to find the 3 prior identical approvals for a given (tenant, action_type,
canonical args) within a 48-hour window, ordered by decision time.

  - canonical_args_hash  TEXT NULL   — SHA-256 of sort-key JSON of decision-
                                       sensitive args; populated at propose
                                       time. NULL on legacy rows.
  - decided_at           TIMESTAMPTZ NULL — wall-clock moment status flipped
                                       to APPROVED/DENIED. NULL while pending.
  - composite index on (tenant_id, action_type, canonical_args_hash, status,
    decided_at) — exact-match lookup for the graduation trigger query.

Plan reference: A6 (auto-fix from /plan-eng-review).
"""

from alembic import op
import sqlalchemy as sa


revision = "0040"
down_revision = "0039"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "action_contracts",
        sa.Column("canonical_args_hash", sa.Text(), nullable=True),
    )
    op.add_column(
        "action_contracts",
        sa.Column("decided_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index(
        "ix_action_contracts_graduation_lookup",
        "action_contracts",
        ["tenant_id", "action_type", "canonical_args_hash", "status", "decided_at"],
    )


def downgrade() -> None:
    op.drop_index("ix_action_contracts_graduation_lookup", table_name="action_contracts")
    op.drop_column("action_contracts", "decided_at")
    op.drop_column("action_contracts", "canonical_args_hash")
