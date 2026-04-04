"""merge_kill_switch_branch

Revision ID: 1f7096834a23
Revises: 0023_create_kill_switch_table, 0031_seed_adapter_policy_rules
Create Date: 2026-04-04 10:29:27.965489
"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '0032_merge_kill_switch_branch'
down_revision = ('0023_create_kill_switch_table', '0031_seed_adapter_policy_rules')
branch_labels = None
depends_on = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
