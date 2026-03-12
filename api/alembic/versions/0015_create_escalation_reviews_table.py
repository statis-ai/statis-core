"""Create escalation_reviews table

Revision ID: 0015_create_escalation_reviews
Revises: 0014_seed_airflow_dag_trigger_policy
Create Date: 2026-03-12 00:00:00.000000

Stores the human review record for ESCALATED actions.
The action FSM tracks the ESCALATED status; this table records
who made the decision, when, and why.
"""
import sqlalchemy as sa
from alembic import op

revision = "0015_create_escalation_reviews"
down_revision = "0014_seed_airflow_dag_trigger_policy"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "escalation_reviews",
        sa.Column("review_id", sa.String(), nullable=False),
        sa.Column("action_id", sa.String(), nullable=False),
        sa.Column("reviewer_id", sa.String(), nullable=False),
        sa.Column("reviewer_decision", sa.String(), nullable=False),  # APPROVED | REJECTED
        sa.Column("reviewer_note", sa.Text(), nullable=True),
        sa.Column(
            "reviewed_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.PrimaryKeyConstraint("review_id"),
        sa.ForeignKeyConstraint(["action_id"], ["action_contracts.action_id"]),
        sa.UniqueConstraint("action_id", name="uq_escalation_reviews_action_id"),
    )
    op.create_index(
        "ix_escalation_reviews_action_id",
        "escalation_reviews",
        ["action_id"],
    )


def downgrade() -> None:
    op.drop_index("ix_escalation_reviews_action_id", table_name="escalation_reviews")
    op.drop_table("escalation_reviews")
