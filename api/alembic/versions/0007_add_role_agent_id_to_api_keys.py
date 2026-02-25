"""Add role and agent_id to api_keys

Revision ID: 0007_add_role_agent_id
Revises: 0006_add_created_at
Create Date: 2026-02-24 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = "0007_add_role_agent_id"
down_revision = "0006_add_created_at"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("api_keys", sa.Column("role", sa.String(), nullable=True))
    op.add_column("api_keys", sa.Column("agent_id", sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column("api_keys", "agent_id")
    op.drop_column("api_keys", "role")
