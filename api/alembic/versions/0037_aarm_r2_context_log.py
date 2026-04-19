"""aarm r2: append-only hash-chained context log

Revision ID: 0037
Revises: 0036
Create Date: 2026-04-19

Creates the context_log_entries table. Every field passed in an action's
context dict at propose time produces one row. Rows are never updated.

No backfill — pre-existing actions have no context log entries, and the
verify endpoint will return chain_valid=True with sequence_count=0 for them.
"""

from alembic import op
import sqlalchemy as sa


revision = "0037"
down_revision = "0036"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "context_log_entries",
        sa.Column("entry_id", sa.String(), primary_key=True),
        sa.Column("action_id", sa.String(), nullable=False),
        sa.Column("tenant_id", sa.String(), nullable=False),
        sa.Column("sequence", sa.Integer(), nullable=False),
        sa.Column("field_key", sa.String(), nullable=False),
        sa.Column("classification", sa.String(length=16), nullable=False),
        sa.Column("content_hash", sa.String(length=64), nullable=False),
        sa.Column("previous_hash", sa.String(length=64), nullable=True),
        sa.Column("chain_hash", sa.String(length=64), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
    )
    op.create_index(
        "ix_context_log_action",
        "context_log_entries",
        ["action_id", "sequence"],
    )
    op.create_index(
        "ix_context_log_tenant",
        "context_log_entries",
        ["tenant_id"],
    )


def downgrade() -> None:
    op.drop_index("ix_context_log_tenant", table_name="context_log_entries")
    op.drop_index("ix_context_log_action", table_name="context_log_entries")
    op.drop_table("context_log_entries")
