"""create threat log table

Revision ID: 0026_create_threat_log_table
Revises: 0025_create_webhooks_table
Create Date: 2026-03-30
"""
from __future__ import annotations

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision = "0026_create_threat_log_table"
down_revision = "0025_create_webhooks_table"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "threat_logs",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("action_id", sa.String(), nullable=False),
        sa.Column("tenant_id", sa.String(), nullable=False),
        sa.Column("threat_types", postgresql.JSONB(), nullable=False),
        sa.Column("threat_level", sa.String(), nullable=False),
        sa.Column("details", sa.String(), nullable=True),
        sa.Column(
            "scanned_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
    )
    op.create_index("ix_threat_logs_tenant_id", "threat_logs", ["tenant_id"])
    op.create_index("ix_threat_logs_action_id", "threat_logs", ["action_id"])


def downgrade() -> None:
    op.drop_index("ix_threat_logs_action_id", table_name="threat_logs")
    op.drop_index("ix_threat_logs_tenant_id", table_name="threat_logs")
    op.drop_table("threat_logs")
