"""Seed HubSpot policy rules

Revision ID: 0018_seed_hubspot_policy
Revises: 0017_seed_zendesk_policy
Create Date: 2026-03-13 00:00:00.000000

Seeds policy rules for hubspot_update_contact and hubspot_create_deal.
Both require operator_approved=true (caller attestation).
"""
import json

import sqlalchemy as sa
from alembic import op

revision = "0018_seed_hubspot_policy"
down_revision = "0017_seed_zendesk_policy"
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
                    'hubspot_update_contact_v1',
                    '1.0',
                    'hubspot_update_contact',
                    '{conditions_json}'::jsonb,
                    'APPROVED',
                    100,
                    true
                ),
                (
                    'hubspot_create_deal_v1',
                    '1.0',
                    'hubspot_create_deal',
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
            "('hubspot_update_contact_v1', 'hubspot_create_deal_v1')"
        )
    )
