"""add description to policy_rules

Revision ID: 0022_add_description_to_policy_rules
Revises: 3f8a2c1d94be
Create Date: 2026-03-26
"""
from __future__ import annotations

import sqlalchemy as sa
from alembic import op

revision = "0022_add_description_to_policy_rules"
down_revision = "3f8a2c1d94be"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "policy_rules",
        sa.Column("description", sa.String(), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("policy_rules", "description")
