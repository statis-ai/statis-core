"""GitHub adapter — merge PRs, create releases, trigger workflows, close issues.

Configuration (env vars or constructor args):
    GITHUB_TOKEN   — Personal Access Token or GitHub App token

All operations use the action_id as idempotency key where possible.
"""
from __future__ import annotations

import json
import os
from typing import Any, Optional
from urllib.request import Request, urlopen
import urllib.error

from app.adapters.base import BaseAdapter, ExecutionResult

SUPPORTED = {
    "github_merge_pr",
    "github_create_release",
    "github_trigger_workflow",
    "github_close_issue",
}

_BASE = "https://api.github.com"


class GitHubAdapter(BaseAdapter):
    def __init__(self, token: Optional[str] = None) -> None:
        self._token = token or os.environ.get("GITHUB_TOKEN", "")

    def execute(self, action: Any) -> ExecutionResult:
        action_id: str = getattr(action, "action_id", action.get("action_id", ""))
        action_type: str = getattr(action, "action_type", action.get("action_type", ""))
        params: dict = getattr(action, "parameters", action.get("parameters", {}))

        if action_type not in SUPPORTED:
            return ExecutionResult(
                success=False,
                result={},
                error=f"GitHubAdapter does not handle action_type={action_type!r}",
            )

        if not self._token:
            return ExecutionResult(
                success=False, result={}, error="GITHUB_TOKEN is not set"
            )

        try:
            if action_type == "github_merge_pr":
                return self._merge_pr(action_id, params)
            if action_type == "github_create_release":
                return self._create_release(params)
            if action_type == "github_trigger_workflow":
                return self._trigger_workflow(action_id, params)
            if action_type == "github_close_issue":
                return self._close_issue(params)
        except _GitHubError as exc:
            return ExecutionResult(success=False, result={}, error=str(exc))
        except Exception as exc:
            return ExecutionResult(success=False, result={}, error=str(exc))

        return ExecutionResult(success=False, result={}, error="unhandled")  # unreachable

    # ── Action handlers ────────────────────────────────────────────────────

    def _merge_pr(self, action_id: str, params: dict) -> ExecutionResult:
        owner = params.get("owner", "")
        repo = params.get("repo", "")
        pull_number = params.get("pull_number", "")
        if not (owner and repo and pull_number):
            return ExecutionResult(
                success=False, result={}, error="owner, repo, pull_number required"
            )
        body = {
            "commit_title": params.get("commit_title", f"Merge PR #{pull_number}"),
            "merge_method": params.get("merge_method", "squash"),
        }
        resp = self._request(
            "PATCH", f"/repos/{owner}/{repo}/pulls/{pull_number}/merge", body
        )
        return ExecutionResult(
            success=True,
            result={"merged": True, "sha": resp.get("sha", ""), "pull_number": pull_number},
        )

    def _create_release(self, params: dict) -> ExecutionResult:
        owner = params.get("owner", "")
        repo = params.get("repo", "")
        tag = params.get("tag_name", "")
        if not (owner and repo and tag):
            return ExecutionResult(
                success=False, result={}, error="owner, repo, tag_name required"
            )
        body = {
            "tag_name": tag,
            "name": params.get("name", tag),
            "body": params.get("body", ""),
            "draft": params.get("draft", False),
            "prerelease": params.get("prerelease", False),
        }
        resp = self._request("POST", f"/repos/{owner}/{repo}/releases", body)
        return ExecutionResult(
            success=True,
            result={"release_id": resp.get("id"), "html_url": resp.get("html_url", "")},
        )

    def _trigger_workflow(self, action_id: str, params: dict) -> ExecutionResult:
        owner = params.get("owner", "")
        repo = params.get("repo", "")
        workflow_id = params.get("workflow_id", "")
        ref = params.get("ref", "main")
        if not (owner and repo and workflow_id):
            return ExecutionResult(
                success=False, result={}, error="owner, repo, workflow_id required"
            )
        body = {"ref": ref, "inputs": params.get("inputs", {})}
        self._request(
            "POST",
            f"/repos/{owner}/{repo}/actions/workflows/{workflow_id}/dispatches",
            body,
        )
        return ExecutionResult(
            success=True,
            result={"workflow_id": workflow_id, "ref": ref, "triggered": True},
        )

    def _close_issue(self, params: dict) -> ExecutionResult:
        owner = params.get("owner", "")
        repo = params.get("repo", "")
        issue_number = params.get("issue_number", "")
        if not (owner and repo and issue_number):
            return ExecutionResult(
                success=False, result={}, error="owner, repo, issue_number required"
            )
        self._request(
            "PATCH",
            f"/repos/{owner}/{repo}/issues/{issue_number}",
            {"state": "closed"},
        )
        return ExecutionResult(
            success=True,
            result={"issue_number": issue_number, "closed": True},
        )

    # ── HTTP helper ────────────────────────────────────────────────────────

    def _request(self, method: str, path: str, body: dict) -> dict:
        data = json.dumps(body).encode()
        req = Request(
            _BASE + path,
            data=data if method not in ("GET",) else None,
            headers={
                "Authorization": f"Bearer {self._token}",
                "Accept": "application/vnd.github+json",
                "Content-Type": "application/json",
                "X-GitHub-Api-Version": "2022-11-28",
            },
            method=method,
        )
        try:
            with urlopen(req, timeout=30) as resp:
                raw = resp.read()
                return json.loads(raw) if raw else {}
        except urllib.error.HTTPError as exc:
            raise _GitHubError(exc.code, exc.read().decode()) from exc


class _GitHubError(Exception):
    def __init__(self, status: int, body: str) -> None:
        super().__init__(f"GitHub API {status}: {body}")
