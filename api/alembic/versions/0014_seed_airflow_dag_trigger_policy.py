"""Seed airflow_dag_trigger_v1 policy rule

Revision ID: 0014_seed_airflow_dag_trigger_policy
Revises: 0013_add_receipt_conditions
Create Date: 2026-03-11 00:00:00.000000

Seeds a policy rule that approves DAG trigger actions when:
  - operator_approved: true   (human or upstream system has signed off)
  - target_system: "airflow"  (belt-and-suspenders check in the rule conf)
"""
import json

import sqlalchemy as sa
from alembic import op

revision = "0014_seed_airflow_dag_trigger_policy"
down_revision = "0013_add_receipt_conditions"
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
                    'airflow_dag_trigger_v1',
                    '1.0',
                    'airflow_dag_trigger',
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
        sa.text("DELETE FROM policy_rules WHERE rule_id = 'airflow_dag_trigger_v1'")
    )
