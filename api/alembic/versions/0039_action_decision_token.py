"""spine: action_contracts.decided_via_token (atomic CAS for token consumption)

Revision ID: 0039
Revises: 0038
Create Date: 2026-04-25

Adds a single nullable column used to make approval-URL token consumption a
race-safe compare-and-swap: the row's `decided_via_token` is updated to the
token only when it is currently NULL, in the same UPDATE that flips status to
APPROVED/DENIED. UNIQUE prevents the same token being recorded against two
different actions if a developer ever crosses wires.

Plan reference: A4 (load-bearing correctness fix from /plan-eng-review).
"""

from alembic import op
import sqlalchemy as sa


revision = "0039"
down_revision = "0038"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "action_contracts",
        sa.Column("decided_via_token", sa.Text(), nullable=True),
    )
    op.create_unique_constraint(
        "uq_action_contracts_decided_via_token",
        "action_contracts",
        ["decided_via_token"],
    )


def downgrade() -> None:
    op.drop_constraint(
        "uq_action_contracts_decided_via_token",
        "action_contracts",
        type_="unique",
    )
    op.drop_column("action_contracts", "decided_via_token")
