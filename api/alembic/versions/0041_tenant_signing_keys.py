"""spine: tenant_signing_keys table (per-tenant HMAC secret + rotation clock)

Revision ID: 0041
Revises: 0040
Create Date: 2026-04-25

There is no canonical `tenants` table in this schema yet — `tenant_id` is an
opaque string foreign key throughout the codebase. This migration adds a
purpose-built table for the URL-signing secret rather than retrofitting one.

  tenant_signing_keys:
    tenant_id    TEXT PRIMARY KEY
    signing_key  TEXT NOT NULL   — base64url(32 random bytes)
    rotated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()

Token verification compares the token's `signed_at` against `rotated_at` —
any token signed before the most recent rotation is rejected (D2 rotation
runbook: "rotation = revocation").

When the canonical tenants table eventually lands, this table becomes a 1:1
join target keyed on tenant_id; no schema rework needed.

Plan reference: D2 (per-tenant HMAC secret + rotation runbook).
"""

from alembic import op
import sqlalchemy as sa


revision = "0041"
down_revision = "0040"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "tenant_signing_keys",
        sa.Column("tenant_id", sa.Text(), primary_key=True),
        sa.Column("signing_key", sa.Text(), nullable=False),
        sa.Column(
            "rotated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
    )


def downgrade() -> None:
    op.drop_table("tenant_signing_keys")
