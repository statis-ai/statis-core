"""add tenant_id to policy_rules

Revision ID: 0020_add_tenant_id_to_policy_rules
Revises: 0019_create_users_table
Create Date: 2026-03-25
"""
from __future__ import annotations

import sqlalchemy as sa
from alembic import op

revision = "0020_add_tenant_id_to_policy_rules"
down_revision = "0019_create_users_table"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add tenant_id column — nullable for backward compat with existing seed rows
    op.add_column(
        "policy_rules",
        sa.Column("tenant_id", sa.String(), nullable=True),
    )

    # Composite index for tenant-scoped rule lookups (action_type + active filter)
    op.create_index(
        "ix_policy_rules_tenant_action_active",
        "policy_rules",
        ["tenant_id", "action_type", "active"],
    )


def downgrade() -> None:
    op.drop_index("ix_policy_rules_tenant_action_active", table_name="policy_rules")
    op.drop_column("policy_rules", "tenant_id")
