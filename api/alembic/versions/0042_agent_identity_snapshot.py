"""spine: action_contracts.agent_identity_snapshot (frozen identity at propose time)

Revision ID: 0042
Revises: 0041
Create Date: 2026-04-25

Adds a JSONB snapshot of the proposing agent's identity at the moment the
action was created. The approval page renders from this snapshot rather than
joining `agents` live — so a forwarded approval URL keeps showing the
ORIGINAL handle/version/lineage even after the agent is renamed, retired,
or its trust source changes.

  agent_identity_snapshot JSONB NULL — shape (informal):
    {
      "handle":         "billing-bot",
      "version":        "v3.2.1",
      "spawned_by":     "deploys/v0.4.0",
      "actions_today":  14,
      "denied_today":   0,
      "agent_class":    "<R6 layer 2>",
      "org_unit":       "<R6 layer 3>",
      "trust_source":   "<R6 layer 4>"
    }

NULL on legacy rows; populated by `POST /actions` going forward.

Plan reference: OV-T2 (snapshot at creation, no live join).
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB


revision = "0042"
down_revision = "0041"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "action_contracts",
        sa.Column("agent_identity_snapshot", JSONB(), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("action_contracts", "agent_identity_snapshot")
