"""lane-1: action_contracts.graduation_snoozed_at (graduation snooze)

Revision ID: 0044
Revises: 0043
Create Date: 2026-04-26

Adds a nullable `graduation_snoozed_at` column on `action_contracts`. The
console graduation banner ("you've approved this 3 times — graduate to a
rule?") is suppressed for D22's snooze interaction state once the operator
clicks "not now". Per-action storage is enough — graduation candidates are
joined on (tenant_id, action_type, canonical_args_hash), and one snoozed
sibling is sufficient to mute the banner for the cluster.

A standalone column (not a JSONB key) keeps the predicate index-friendly
and simple to reason about. If snoozes ever become per-user we'll migrate
to a `graduation_snoozes(tenant_id, action_type, args_hash, user_id)` table
and drop this column.

Plan reference: Codex finding #13 (backend graduation snooze).
"""

from alembic import op
import sqlalchemy as sa


revision = "0044"
down_revision = "0043"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "action_contracts",
        sa.Column("graduation_snoozed_at", sa.DateTime(timezone=True), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("action_contracts", "graduation_snoozed_at")
