"""add mode to receipts

Revision ID: 0024_add_mode_to_receipts
Revises: 0023_add_mode_to_action_contracts
Create Date: 2026-03-30
"""
from __future__ import annotations

import sqlalchemy as sa
from alembic import op

revision = "0024_add_mode_to_receipts"
down_revision = "0023_add_mode_to_action_contracts"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "receipts",
        sa.Column("mode", sa.String(), nullable=False, server_default="live"),
    )


def downgrade() -> None:
    op.drop_column("receipts", "mode")
