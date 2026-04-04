"""Seed policy rules for GitHub, Linear, and Slack adapters

Revision ID: 0031_seed_adapter_policy_rules
Revises: 0030_create_agents_table
Create Date: 2026-04-04 00:00:00.000000

Seeds global ESCALATED rules for all 7 new action types.
Operators must create tenant-specific APPROVED rules to allow execution.
Fail-closed default keeps these actions in human-review queue until configured.
"""

import json

import sqlalchemy as sa
from alembic import op

revision = "0031_seed_adapter_policy_rules"
down_revision = "0030_create_agents_table"
branch_labels = None
depends_on = None

RULES = [
    # GitHub
    {"rule_id": "github_merge_pr_default_v1", "action_type": "github_merge_pr", "decision": "ESCALATED"},
    {"rule_id": "github_create_release_default_v1", "action_type": "github_create_release", "decision": "ESCALATED"},
    {"rule_id": "github_trigger_workflow_default_v1", "action_type": "github_trigger_workflow", "decision": "ESCALATED"},
    {"rule_id": "github_close_issue_default_v1", "action_type": "github_close_issue", "decision": "ESCALATED"},
    # Linear
    {"rule_id": "linear_create_issue_default_v1", "action_type": "linear_create_issue", "decision": "APPROVED"},
    {"rule_id": "linear_update_issue_default_v1", "action_type": "linear_update_issue", "decision": "APPROVED"},
    # Slack
    {"rule_id": "slack_send_message_default_v1", "action_type": "slack_send_message", "decision": "APPROVED"},
    {"rule_id": "slack_update_message_default_v1", "action_type": "slack_update_message", "decision": "APPROVED"},
]

RULE_IDS = [r["rule_id"] for r in RULES]


def upgrade() -> None:
    values_clauses = []
    for r in RULES:
        conditions = json.dumps({})
        values_clauses.append(
            f"('{r['rule_id']}', '1.0', '{r['action_type']}', "
            f"'{conditions}'::jsonb, '{r['decision']}', 1, true)"
        )
    values_sql = ",\n                ".join(values_clauses)
    op.execute(
        sa.text(
            f"""
            INSERT INTO policy_rules
                (rule_id, rule_version, action_type, conditions, decision, priority, active)
            VALUES
                {values_sql}
            ON CONFLICT (rule_id) DO NOTHING
            """
        )
    )


def downgrade() -> None:
    ids = ", ".join(f"'{rid}'" for rid in RULE_IDS)
    op.execute(
        sa.text(f"DELETE FROM policy_rules WHERE rule_id IN ({ids})")
    )
