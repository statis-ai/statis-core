"""Create quarantine table for poison-pill DLQ

Revision ID: 0008_quarantine
Revises: 0007_add_role_agent_id
Create Date: 2026-02-24 14:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = "0008_quarantine"
down_revision = "0007_add_role_agent_id"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "quarantine",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("tenant_id", sa.String(), nullable=False),
        sa.Column("entity_type", sa.String(), nullable=False),
        sa.Column("entity_id", sa.String(), nullable=False),
        sa.Column("event_id", sa.String(), nullable=False),
        sa.Column("failure_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("last_error", sa.Text(), nullable=True),
        sa.Column("quarantined_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.UniqueConstraint(
            "tenant_id", "entity_type", "entity_id", name="uq_quarantine_entity"
        ),
    )


def downgrade() -> None:
    op.drop_table("quarantine")
