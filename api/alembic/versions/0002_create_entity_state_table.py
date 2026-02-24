"""create entity_state table

Revision ID: 0002_create_entity_state
Revises: 0001_create_events_table
Create Date: 2026-02-19 00:01:00
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0002_create_entity_state"
down_revision = "0001_create_events_table"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "entity_state",
        sa.Column("entity_type", sa.String(), nullable=False),
        sa.Column("entity_id", sa.String(), nullable=False),
        sa.Column("state", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("state_version", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("last_event_id", sa.String(), nullable=True),
        sa.Column("last_occurred_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("state_hash", sa.String(), nullable=True),
        sa.Column(
            "materialized_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column(
            "provenance_event_ids",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=False,
            server_default="[]",
        ),
        sa.PrimaryKeyConstraint("entity_type", "entity_id"),
        sa.ForeignKeyConstraint(
            ["last_event_id"], ["events.event_id"], name="fk_entity_state_last_event"
        ),
    )


def downgrade() -> None:
    op.drop_table("entity_state")
