"""add key_prefix to api_keys

Revision ID: 3f8a2c1d94be
Revises: 0020_add_tenant_id_to_policy_rules
Create Date: 2026-03-26
"""
from alembic import op
import sqlalchemy as sa

revision = "3f8a2c1d94be"
down_revision = "0020_add_tenant_id_to_policy_rules"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("api_keys", sa.Column("key_prefix", sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column("api_keys", "key_prefix")
