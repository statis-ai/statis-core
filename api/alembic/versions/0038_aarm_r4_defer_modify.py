"""aarm r4: DEFER state machine + MODIFY parameter patch

Revision ID: 0038
Revises: 0037
Create Date: 2026-04-19

Adds columns for AARM R4 runtime semantics:

  action_contracts:
    - deferred_until  TIMESTAMPTZ NULL  — wall-clock moment the DEFERRED
                                          action becomes eligible for re-evaluation
    - defer_count     INT NOT NULL DEFAULT 0  — how many DEFER decisions have fired

  policy_rules:
    - defer_seconds       INT NULL   — wait before re-eval on DEFERRED rules
    - max_defer_attempts  INT NULL   — cap; on exceed, auto-deny
    - modify_patch        JSONB NULL — shallow-merged into parameters on MODIFIED

All columns are nullable or have safe defaults. Existing rows are unaffected.
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB


revision = "0038"
down_revision = "0037"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "action_contracts",
        sa.Column("deferred_until", sa.DateTime(timezone=True), nullable=True),
    )
    op.add_column(
        "action_contracts",
        sa.Column(
            "defer_count",
            sa.Integer(),
            nullable=False,
            server_default="0",
        ),
    )

    op.add_column("policy_rules", sa.Column("defer_seconds", sa.Integer(), nullable=True))
    op.add_column("policy_rules", sa.Column("max_defer_attempts", sa.Integer(), nullable=True))
    op.add_column("policy_rules", sa.Column("modify_patch", JSONB(), nullable=True))


def downgrade() -> None:
    op.drop_column("policy_rules", "modify_patch")
    op.drop_column("policy_rules", "max_defer_attempts")
    op.drop_column("policy_rules", "defer_seconds")

    op.drop_column("action_contracts", "defer_count")
    op.drop_column("action_contracts", "deferred_until")
