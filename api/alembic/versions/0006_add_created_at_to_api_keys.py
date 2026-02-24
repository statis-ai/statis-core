"""Add created_at to api_keys

Revision ID: 0006_add_created_at
Revises: 0005_add_multi_tenancy
Create Date: 2026-02-23 18:21:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.schema import Sequence, CreateSequence, DropSequence
from sqlalchemy import func


# revision identifiers, used by Alembic.
revision = '0006_add_created_at'
down_revision = '0005_add_multi_tenancy'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add created_at column to api_keys
    op.add_column(
        'api_keys',
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=func.now(), nullable=True)
    )
    
    # Backfill missing with current time, then make non-nullable
    op.execute("UPDATE api_keys SET created_at = NOW() WHERE created_at IS NULL")
    op.alter_column('api_keys', 'created_at', nullable=False)


def downgrade() -> None:
    # Drop created_at column from api_keys
    op.drop_column('api_keys', 'created_at')
