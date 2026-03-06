"""Add conditions_evaluated and entity_state_snapshot to receipts

Revision ID: 0013_add_receipt_conditions
Revises: 0012_create_execution_locks
Create Date: 2026-03-06 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0013_add_receipt_conditions"
down_revision = "0012_create_execution_locks"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "receipts",
        sa.Column(
            "conditions_evaluated",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=True,
        ),
    )
    op.add_column(
        "receipts",
        sa.Column(
            "entity_state_snapshot",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=True,
        ),
    )


def downgrade() -> None:
    op.drop_column("receipts", "conditions_evaluated")
    op.drop_column("receipts", "entity_state_snapshot")
