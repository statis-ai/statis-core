"""Seed GitHub dogfood policy rules

Revision ID: 0028_seed_github_dogfood_policy
Revises: 0027_add_sso_fields_to_users
Create Date: 2026-04-02 00:00:00.000000

Seeds 7 policy rules for the GitHub dogfood action types:
  github_merge_pr, github_create_release, github_trigger_workflow, github_close_issue.
Phase 1 is audit-only (GenericAdapter); these rules govern proposal evaluation.
"""
import json

import sqlalchemy as sa
from alembic import op

revision = "0028_seed_github_dogfood_policy"
down_revision = "0027_add_sso_fields_to_users"
branch_labels = None
depends_on = None

RULES = [
    {
        "rule_id": "github_merge_pr_v1",
        "rule_version": "1.0",
        "action_type": "github_merge_pr",
        "conditions": json.dumps({"ci_status": "passed", "approvals_gte": 1}),
        "decision": "APPROVED",
        "priority": 10,
    },
    {
        "rule_id": "github_merge_pr_no_ci_v1",
        "rule_version": "1.0",
        "action_type": "github_merge_pr",
        "conditions": json.dumps({}),
        "decision": "ESCALATED",
        "priority": 1,
    },
    {
        "rule_id": "github_create_release_v1",
        "rule_version": "1.0",
        "action_type": "github_create_release",
        "conditions": json.dumps({"operator_approved": True}),
        "decision": "ESCALATED",
        "priority": 10,
    },
    {
        "rule_id": "github_trigger_workflow_staging_v1",
        "rule_version": "1.0",
        "action_type": "github_trigger_workflow",
        "conditions": json.dumps({"environment": "staging"}),
        "decision": "APPROVED",
        "priority": 10,
    },
    {
        "rule_id": "github_trigger_workflow_prod_v1",
        "rule_version": "1.0",
        "action_type": "github_trigger_workflow",
        "conditions": json.dumps({"environment": "production"}),
        "decision": "ESCALATED",
        "priority": 10,
    },
    {
        "rule_id": "github_close_issue_v1",
        "rule_version": "1.0",
        "action_type": "github_close_issue",
        "conditions": json.dumps({"opened_by_agent": True}),
        "decision": "APPROVED",
        "priority": 10,
    },
    {
        "rule_id": "github_close_issue_human_v1",
        "rule_version": "1.0",
        "action_type": "github_close_issue",
        "conditions": json.dumps({}),
        "decision": "ESCALATED",
        "priority": 1,
    },
]

RULE_IDS = [r["rule_id"] for r in RULES]


def upgrade() -> None:
    values_clauses = []
    for r in RULES:
        values_clauses.append(
            f"('{r['rule_id']}', '{r['rule_version']}', '{r['action_type']}', "
            f"'{r['conditions']}'::jsonb, '{r['decision']}', {r['priority']}, true)"
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
