"""Add multi-tenancy

Revision ID: 0005_add_multi_tenancy
Revises: 0004_create_deliveries
Create Date: 2026-02-23 15:15:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = "0005_add_multi_tenancy"
down_revision = "0004_create_deliveries"
branch_labels = None
depends_on = None

def upgrade() -> None:
    # 1. Create api_keys table
    op.create_table(
        "api_keys",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("hashed_key", sa.String(), nullable=False),
        sa.Column("tenant_id", sa.String(), nullable=False),
        sa.Column("label", sa.String(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_api_keys_hashed_key", "api_keys", ["hashed_key"], unique=True)
    op.create_index("ix_api_keys_tenant_id", "api_keys", ["tenant_id"], unique=False)

    # 2. Add tenant_id to existing tables with a default 'system' value for existing data
    tables_to_update = ["events", "entity_state", "subscriptions", "deliveries"]
    for table_name in tables_to_update:
        op.add_column(
            table_name,
            sa.Column("tenant_id", sa.String(), server_default="system", nullable=False)
        )
        # Remove the server default so new inserts require tenant_id
        op.alter_column(table_name, "tenant_id", server_default=None)

    # 3. Update the ix_events_ordering index to include tenant_id
    op.drop_index("ix_events_ordering", table_name="events")
    op.create_index(
        "ix_events_ordering",
        "events",
        ["tenant_id", "occurred_at", "ingested_at", "event_id"],
        unique=False
    )

    # 4. Update the primary key of entity_state to include tenant_id
    op.drop_constraint("entity_state_pkey", "entity_state", type_="primary")
    op.create_primary_key(
        "entity_state_pkey",
        "entity_state",
        ["tenant_id", "entity_type", "entity_id"]
    )

    # 5. Prepend system: to existing dedupe_keys in deliveries to avoid collision patterns shifting
    op.execute("UPDATE deliveries SET dedupe_key = 'system:' || dedupe_key")

def downgrade() -> None:
    # Revert dedupe_key in deliveries
    op.execute("UPDATE deliveries SET dedupe_key = SUBSTRING(dedupe_key FROM 8) WHERE dedupe_key LIKE 'system:%'")

    # Revert entity_state primary key
    op.drop_constraint("entity_state_pkey", "entity_state", type_="primary")
    op.create_primary_key(
        "entity_state_pkey",
        "entity_state",
        ["entity_type", "entity_id"]
    )

    # Revert ix_events_ordering index
    op.drop_index("ix_events_ordering", table_name="events")
    op.create_index(
        "ix_events_ordering",
        "events",
        ["occurred_at", "ingested_at", "event_id"],
        unique=False
    )

    # Remove tenant_id columns
    tables_to_update = ["events", "entity_state", "subscriptions", "deliveries"]
    for table_name in tables_to_update:
        op.drop_column(table_name, "tenant_id")

    # Drop api_keys table
    op.drop_table("api_keys")
