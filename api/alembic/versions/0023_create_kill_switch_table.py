"""create kill_switches table

Revision ID: 0023_create_kill_switch_table
Revises: 0022_add_description_to_policy_rules
Create Date: 2026-03-30
"""
from __future__ import annotations

import sqlalchemy as sa
from alembic import op

revision = "0023_create_kill_switch_table"
down_revision = "0022_add_description_to_policy_rules"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "kill_switches",
        sa.Column("tenant_id", sa.String(), primary_key=True, nullable=False),
        sa.Column("active", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("activated_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("activated_by", sa.String(), nullable=True),
    )


def downgrade() -> None:
    op.drop_table("kill_switches")
