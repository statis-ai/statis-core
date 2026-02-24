"""create events table

Revision ID: 0001_create_events_table
Revises:
Create Date: 2026-02-19 00:00:00
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "0001_create_events_table"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "events",
        sa.Column("event_id", sa.String(), nullable=False),
        sa.Column("entity_type", sa.String(), nullable=False),
        sa.Column("entity_id", sa.String(), nullable=False),
        sa.Column("event_type", sa.String(), nullable=False),
        sa.Column("payload", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("occurred_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column(
            "ingested_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column("producer", sa.String(), nullable=False),
        sa.Column("schema_version", sa.String(), nullable=False),
        sa.Column("trace_id", sa.String(), nullable=True),
        sa.PrimaryKeyConstraint("event_id"),
        sa.UniqueConstraint("event_id", name="uq_events_event_id"),
    )
    op.create_index(
        "ix_events_ordering",
        "events",
        ["occurred_at", "ingested_at", "event_id"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index("ix_events_ordering", table_name="events")
    op.drop_table("events")
