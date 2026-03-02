"""Create action_contracts table

Revision ID: 0009_create_action_contracts
Revises: 0008_quarantine
Create Date: 2026-02-28 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0009_create_action_contracts"
down_revision = "0008_quarantine"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "action_contracts",
        sa.Column("action_id", sa.String(), nullable=False),
        sa.Column("tenant_id", sa.String(), nullable=False),
        sa.Column("proposed_by", sa.String(), nullable=False),
        sa.Column("action_type", sa.String(), nullable=False),
        sa.Column(
            "target_entity",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=False,
        ),
        sa.Column("target_system", sa.String(), nullable=False),
        sa.Column(
            "parameters",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=False,
        ),
        sa.Column(
            "context",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=False,
        ),
        sa.Column("status", sa.String(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.PrimaryKeyConstraint("action_id"),
    )
    op.create_index(
        "ix_action_contracts_tenant_status",
        "action_contracts",
        ["tenant_id", "status"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index("ix_action_contracts_tenant_status", table_name="action_contracts")
    op.drop_table("action_contracts")
