"""Seed Zendesk policy rules

Revision ID: 0017_seed_zendesk_policy
Revises: 0016_seed_salesforce_policy
Create Date: 2026-03-13 00:00:00.000000

Seeds policy rules for zendesk_create_ticket and zendesk_update_ticket.
Both require operator_approved=true (caller attestation).
"""
import json

import sqlalchemy as sa
from alembic import op

revision = "0017_seed_zendesk_policy"
down_revision = "0016_seed_salesforce_policy"
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
                    'zendesk_create_ticket_v1',
                    '1.0',
                    'zendesk_create_ticket',
                    '{conditions_json}'::jsonb,
                    'APPROVED',
                    100,
                    true
                ),
                (
                    'zendesk_update_ticket_v1',
                    '1.0',
                    'zendesk_update_ticket',
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
            "('zendesk_create_ticket_v1', 'zendesk_update_ticket_v1')"
        )
    )
