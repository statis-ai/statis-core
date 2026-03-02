"""Create execution_locks table

Revision ID: 0012_create_execution_locks
Revises: 0011_create_receipts
Create Date: 2026-03-01 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = "0012_create_execution_locks"
down_revision = "0011_create_receipts"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "execution_locks",
        sa.Column("action_id", sa.String(), nullable=False),
        sa.Column("worker_id", sa.String(), nullable=False),
        sa.Column("acquired_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("action_id"),
    )


def downgrade() -> None:
    op.drop_table("execution_locks")
