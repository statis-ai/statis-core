"""add mode to action_contracts

Revision ID: 0023_add_mode_to_action_contracts
Revises: 0022_add_description_to_policy_rules
Create Date: 2026-03-30
"""
from __future__ import annotations

import sqlalchemy as sa
from alembic import op

revision = "0023_add_mode_to_action_contracts"
down_revision = "0022_add_description_to_policy_rules"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "action_contracts",
        sa.Column("mode", sa.String(), nullable=False, server_default="live"),
    )


def downgrade() -> None:
    op.drop_column("action_contracts", "mode")
