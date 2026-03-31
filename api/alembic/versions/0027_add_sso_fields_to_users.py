"""add sso fields to users

Revision ID: 0027_add_sso_fields_to_users
Revises: 0026_create_threat_log_table
Create Date: 2026-03-30
"""
from __future__ import annotations

import sqlalchemy as sa
from alembic import op

revision = "0027_add_sso_fields_to_users"
down_revision = "0026_create_threat_log_table"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("users", sa.Column("sso_provider", sa.String(), nullable=True))
    op.add_column("users", sa.Column("sso_subject", sa.String(), nullable=True))
    # password_hash is empty string for SSO users — make nullable
    op.alter_column("users", "password_hash", nullable=True)


def downgrade() -> None:
    op.alter_column("users", "password_hash", nullable=False)
    op.drop_column("users", "sso_subject")
    op.drop_column("users", "sso_provider")
