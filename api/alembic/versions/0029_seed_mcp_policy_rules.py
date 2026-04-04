"""Seed MCP policy rules (fail-closed default)

Revision ID: 0029_seed_mcp_policy_rules
Revises: 0028_seed_github_dogfood_policy
Create Date: 2026-04-04 00:00:00.000000

Adds a global deny-by-default rule for action_type='mcp_tool_call'.
Operators must create tenant-specific APPROVED rules to allow MCP tool calls.
This ensures fail-closed behavior for MCP-native agents out of the box.
"""

import sqlalchemy as sa
from alembic import op

revision = "0029_seed_mcp_policy_rules"
down_revision = "0028_seed_github_dogfood_policy"
branch_labels = None
depends_on = None

RULE_ID = "mcp_tool_call_deny_default"


def upgrade() -> None:
    op.execute(
        sa.text(
            """
            INSERT INTO policy_rules
                (rule_id, rule_version, action_type, conditions, decision, priority, active)
            VALUES
                ('mcp_tool_call_deny_default', '1.0', 'mcp_tool_call', '{}'::jsonb, 'DENIED', 1, true)
            ON CONFLICT (rule_id) DO NOTHING
            """
        )
    )


def downgrade() -> None:
    op.execute(
        sa.text(f"DELETE FROM policy_rules WHERE rule_id = '{RULE_ID}'")
    )
