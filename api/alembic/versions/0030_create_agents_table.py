"""Create agents table

Revision ID: 0030_create_agents_table
Revises: 0029_seed_mcp_policy_rules
Create Date: 2026-04-04 00:00:00.000000

Adds the agents table for optional agent registration and enforcement.
Unregistered proposed_by strings continue to pass through unchanged
(backward compatible). Once an agent is registered, its allowed_action_types
and is_active state are enforced at proposal time.
"""

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects.postgresql import JSONB

revision = "0030_create_agents_table"
down_revision = "0029_seed_mcp_policy_rules"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "agents",
        sa.Column("agent_id", sa.String(), primary_key=True),
        sa.Column("tenant_id", sa.String(), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column(
            "allowed_action_types",
            JSONB(),
            nullable=False,
            server_default="[]",
        ),
        sa.Column("rate_limit_per_hour", sa.Integer(), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("NOW()"),
        ),
    )
    op.create_index("ix_agents_tenant_id", "agents", ["tenant_id"])


def downgrade() -> None:
    op.drop_index("ix_agents_tenant_id", table_name="agents")
    op.drop_table("agents")
