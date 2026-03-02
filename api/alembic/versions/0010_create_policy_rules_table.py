"""Create policy_rules table and seed churn_retention_v1

Revision ID: 0010_create_policy_rules
Revises: 0009_create_action_contracts
Create Date: 2026-02-28 00:00:00.000000

"""
import json

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0010_create_policy_rules"
down_revision = "0009_create_action_contracts"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "policy_rules",
        sa.Column("rule_id", sa.String(), nullable=False),
        sa.Column("rule_version", sa.String(), nullable=False),
        sa.Column("action_type", sa.String(), nullable=False),
        sa.Column(
            "conditions",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=False,
        ),
        sa.Column("decision", sa.String(), nullable=False),
        sa.Column("priority", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("active", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.PrimaryKeyConstraint("rule_id"),
    )
    op.create_index(
        "ix_policy_rules_action_type_active",
        "policy_rules",
        ["action_type", "active"],
        unique=False,
    )

    # Seed the canonical churn retention rule.
    # Embed JSON as a literal with explicit ::jsonb cast — psycopg3 won't
    # auto-cast a bound string parameter to jsonb.
    conditions_json = json.dumps(
        {"churn_risk": True, "min_ltv": 1000, "no_discount_days": 30}
    )
    op.execute(
        sa.text(
            f"""
            INSERT INTO policy_rules
                (rule_id, rule_version, action_type, conditions, decision, priority, active)
            VALUES
                (
                    'churn_retention_v1',
                    '1.0',
                    'retention_offer',
                    '{conditions_json}'::jsonb,
                    'APPROVED',
                    100,
                    true
                )
            ON CONFLICT (rule_id) DO NOTHING
            """
        )
    )


def downgrade() -> None:
    op.drop_index("ix_policy_rules_action_type_active", table_name="policy_rules")
    op.drop_table("policy_rules")
