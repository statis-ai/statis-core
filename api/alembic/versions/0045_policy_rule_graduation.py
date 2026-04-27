"""graduation: policy_rules.canonical_args_hash + source + graduated_from_action_id

Revision ID: 0045
Revises: 0044
Create Date: 2026-04-26

Adds the columns the auto-graduation service needs to land the 3rd-approval
→ policy rule promotion (D22). Keeps it strictly additive so manual rules
(seeded `churn_retention_v1`, the GitHub dogfood family, etc.) are unaffected.

Columns
  - canonical_args_hash : nullable str. NULL for manual rules. For
                          graduated rules, holds the SHA-256 over the
                          canonical args shape that triggered graduation.
                          Evaluator does an exact-match on this when
                          deciding whether a graduated rule applies.
  - source              : 'manual' | 'graduated'. Defaults to 'manual' so
                          existing rows are correctly classified without a
                          backfill statement.
  - graduated_from_action_id : nullable str (no FK constraint — action_contracts
                          rows are never deleted, but adding the FK adds
                          migration churn for testcontainers and provides
                          no real safety here). Audit pointer to the 3rd
                          approval that triggered the draft.

Index ix_policy_rules_graduation_lookup on (tenant_id, action_type,
canonical_args_hash) is the evaluator hot-path: "given an incoming action,
is there a graduated rule for this exact shape?"

Plan reference: D22 graduation auto-draft (post-OV4 Week 1 envelope).
"""

from alembic import op
import sqlalchemy as sa


revision = "0045"
down_revision = "0044"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "policy_rules",
        sa.Column("canonical_args_hash", sa.Text(), nullable=True),
    )
    op.add_column(
        "policy_rules",
        sa.Column(
            "source",
            sa.String(length=16),
            nullable=False,
            server_default="manual",
        ),
    )
    op.add_column(
        "policy_rules",
        sa.Column("graduated_from_action_id", sa.String(), nullable=True),
    )
    op.create_index(
        "ix_policy_rules_graduation_lookup",
        "policy_rules",
        ["tenant_id", "action_type", "canonical_args_hash"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index("ix_policy_rules_graduation_lookup", table_name="policy_rules")
    op.drop_column("policy_rules", "graduated_from_action_id")
    op.drop_column("policy_rules", "source")
    op.drop_column("policy_rules", "canonical_args_hash")
