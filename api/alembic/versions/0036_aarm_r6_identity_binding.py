"""aarm r6: 4-layer identity binding columns

Revision ID: 0036
Revises: 0035
Create Date: 2026-04-19

Adds nullable columns for AARM R6 identity binding:
  - agents.agent_class     — layer 2: capability/role label
  - agents.org_unit        — layer 3: organizational unit
  - api_keys.trust_source  — layer 4: credential type ("api_key" | "oauth" | "mtls")
  - action_contracts.agent_class   — snapshot of agent layer 2 at propose time
  - action_contracts.org_unit      — snapshot of agent layer 3 at propose time
  - action_contracts.trust_source  — layer 4 credential type at propose time

All columns are nullable. Pre-existing rows retain NULL and are unaffected.
No data backfill is required or attempted.
"""

from alembic import op
import sqlalchemy as sa

revision = "0036"
down_revision = "0035"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("agents", sa.Column("agent_class", sa.Text(), nullable=True))
    op.add_column("agents", sa.Column("org_unit", sa.Text(), nullable=True))

    op.add_column("api_keys", sa.Column("trust_source", sa.Text(), nullable=True))

    op.add_column("action_contracts", sa.Column("agent_class", sa.Text(), nullable=True))
    op.add_column("action_contracts", sa.Column("org_unit", sa.Text(), nullable=True))
    op.add_column("action_contracts", sa.Column("trust_source", sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column("action_contracts", "trust_source")
    op.drop_column("action_contracts", "org_unit")
    op.drop_column("action_contracts", "agent_class")

    op.drop_column("api_keys", "trust_source")

    op.drop_column("agents", "org_unit")
    op.drop_column("agents", "agent_class")
