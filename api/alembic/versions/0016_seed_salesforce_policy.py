"""Seed Salesforce policy rules

Revision ID: 0016_seed_salesforce_policy
Revises: 0015_create_escalation_reviews_table
Create Date: 2026-03-13 00:00:00.000000

Seeds policy rules for salesforce_update_record and salesforce_create_record.
Both require operator_approved=true (caller attestation).
"""
import json

import sqlalchemy as sa
from alembic import op

revision = "0016_seed_salesforce_policy"
down_revision = "0015_create_escalation_reviews_table"
branch_labels = None
depends_on = None


def upgrade() -> None:
    conditions_json = json.dumps({"operator_approved": True})
    op.execute(
        sa.text(
            f"""
            INSERT INTO policy_rules
                (rule_id, rule_version, action_type, conditions, decision, priority, active)
            VALUES
                (
                    'salesforce_update_record_v1',
                    '1.0',
                    'salesforce_update_record',
                    '{conditions_json}'::jsonb,
                    'APPROVED',
                    100,
                    true
                ),
                (
                    'salesforce_create_record_v1',
                    '1.0',
                    'salesforce_create_record',
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
    op.execute(
        sa.text(
            "DELETE FROM policy_rules WHERE rule_id IN "
            "('salesforce_update_record_v1', 'salesforce_create_record_v1')"
        )
    )
