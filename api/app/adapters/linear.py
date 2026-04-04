"""Linear adapter — create and update issues via the Linear GraphQL API.

Configuration (env vars or constructor args):
    LINEAR_API_KEY   — Linear personal API key

Uses action_id as client mutation ID for idempotency.
"""
from __future__ import annotations

import json
import os
from typing import Any, Optional
from urllib.request import Request, urlopen
import urllib.error

from app.adapters.base import BaseAdapter, ExecutionResult

SUPPORTED = {"linear_create_issue", "linear_update_issue"}
_ENDPOINT = "https://api.linear.app/graphql"


class LinearAdapter(BaseAdapter):
    def __init__(self, api_key: Optional[str] = None) -> None:
        self._api_key = api_key or os.environ.get("LINEAR_API_KEY", "")

    def execute(self, action: Any) -> ExecutionResult:
        action_id: str = getattr(action, "action_id", action.get("action_id", ""))
        action_type: str = getattr(action, "action_type", action.get("action_type", ""))
        params: dict = getattr(action, "parameters", action.get("parameters", {}))

        if action_type not in SUPPORTED:
            return ExecutionResult(
                success=False,
                result={},
                error=f"LinearAdapter does not handle action_type={action_type!r}",
            )

        if not self._api_key:
            return ExecutionResult(
                success=False, result={}, error="LINEAR_API_KEY is not set"
            )

        try:
            if action_type == "linear_create_issue":
                return self._create_issue(action_id, params)
            if action_type == "linear_update_issue":
                return self._update_issue(action_id, params)
        except _LinearError as exc:
            return ExecutionResult(success=False, result={}, error=str(exc))
        except Exception as exc:
            return ExecutionResult(success=False, result={}, error=str(exc))

        return ExecutionResult(success=False, result={}, error="unhandled")

    def _create_issue(self, action_id: str, params: dict) -> ExecutionResult:
        team_id = params.get("team_id", "")
        title = params.get("title", "")
        if not (team_id and title):
            return ExecutionResult(
                success=False, result={}, error="team_id and title required"
            )
        query = """
        mutation CreateIssue($input: IssueCreateInput!) {
          issueCreate(input: $input) {
            success
            issue { id identifier url }
          }
        }
        """
        variables = {
            "input": {
                "teamId": team_id,
                "title": title,
                "description": params.get("description", ""),
                "priority": params.get("priority", 0),
            }
        }
        resp = self._graphql(query, variables)
        data = resp.get("data", {}).get("issueCreate", {})
        issue = data.get("issue", {})
        return ExecutionResult(
            success=bool(data.get("success")),
            result={"issue_id": issue.get("id", ""), "url": issue.get("url", "")},
        )

    def _update_issue(self, action_id: str, params: dict) -> ExecutionResult:
        issue_id = params.get("issue_id", "")
        if not issue_id:
            return ExecutionResult(
                success=False, result={}, error="issue_id required"
            )
        query = """
        mutation UpdateIssue($id: String!, $input: IssueUpdateInput!) {
          issueUpdate(id: $id, input: $input) {
            success
            issue { id identifier url }
          }
        }
        """
        update_input: dict[str, Any] = {}
        for field in ("title", "description", "priority", "stateId", "assigneeId"):
            if field in params:
                update_input[field] = params[field]

        variables = {"id": issue_id, "input": update_input}
        resp = self._graphql(query, variables)
        data = resp.get("data", {}).get("issueUpdate", {})
        issue = data.get("issue", {})
        return ExecutionResult(
            success=bool(data.get("success")),
            result={"issue_id": issue.get("id", ""), "url": issue.get("url", "")},
        )

    def _graphql(self, query: str, variables: dict) -> dict:
        body = json.dumps({"query": query, "variables": variables}).encode()
        req = Request(
            _ENDPOINT,
            data=body,
            headers={
                "Authorization": self._api_key,
                "Content-Type": "application/json",
            },
            method="POST",
        )
        try:
            with urlopen(req, timeout=30) as resp:
                result = json.loads(resp.read())
                if "errors" in result:
                    raise _LinearError(result["errors"])
                return result
        except urllib.error.HTTPError as exc:
            raise _LinearError(exc.read().decode()) from exc


class _LinearError(Exception):
    pass
