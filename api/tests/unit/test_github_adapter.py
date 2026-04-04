"""Unit tests for GitHubAdapter."""
from __future__ import annotations

import json
from http.server import BaseHTTPRequestHandler, HTTPServer
from threading import Thread
from typing import Any
from unittest.mock import MagicMock

import pytest

from app.adapters.github import GitHubAdapter


def _action(
    action_id: str = "act-1",
    action_type: str = "github_merge_pr",
    **params: Any,
) -> MagicMock:
    m = MagicMock()
    m.action_id = action_id
    m.action_type = action_type
    m.parameters = params
    return m


class _FakeGitHubHandler(BaseHTTPRequestHandler):
    responses: list[tuple[int, dict]] = []
    last_request_body: dict = {}
    last_request_path: str = ""

    def log_message(self, *args: Any) -> None:
        pass

    def _handle(self) -> None:
        length = int(self.headers.get("Content-Length", 0))
        body = json.loads(self.rfile.read(length)) if length else {}
        type(self).last_request_body = body
        type(self).last_request_path = self.path

        status, resp_body = type(self).responses.pop(0)
        payload = json.dumps(resp_body).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)

    do_PATCH = _handle
    do_POST = _handle


def _make_server(responses: list[tuple[int, dict]]) -> tuple[HTTPServer, str]:
    _FakeGitHubHandler.responses = list(responses)
    _FakeGitHubHandler.last_request_body = {}
    _FakeGitHubHandler.last_request_path = ""
    server = HTTPServer(("127.0.0.1", 0), _FakeGitHubHandler)
    port = server.server_address[1]
    t = Thread(target=server.handle_request)
    t.daemon = True
    t.start()
    return server, f"http://127.0.0.1:{port}"


def _adapter(base_url: str) -> GitHubAdapter:
    adapter = GitHubAdapter(token="ghp_test")
    adapter._token = "ghp_test"
    # Patch _BASE used in adapter to point to our fake server
    import app.adapters.github as mod
    mod._BASE = base_url
    return adapter


def test_unsupported_action_type():
    adapter = GitHubAdapter(token="tok")
    action = _action(action_type="apply_discount")
    result = adapter.execute(action)
    assert result.success is False
    assert "does not handle" in (result.error or "")


def test_missing_token():
    adapter = GitHubAdapter(token="")
    action = _action(action_type="github_merge_pr", owner="o", repo="r", pull_number=1)
    result = adapter.execute(action)
    assert result.success is False
    assert "GITHUB_TOKEN" in (result.error or "")


def test_merge_pr_success():
    server, base_url = _make_server([(200, {"sha": "abc123", "merged": True})])
    adapter = _adapter(base_url)
    action = _action(action_type="github_merge_pr", owner="statis-ai", repo="core", pull_number=42)
    result = adapter.execute(action)
    assert result.success is True
    assert result.result["sha"] == "abc123"
    assert result.result["pull_number"] == 42


def test_merge_pr_missing_params():
    adapter = GitHubAdapter(token="tok")
    action = _action(action_type="github_merge_pr", owner="statis-ai")  # missing repo + pull_number
    result = adapter.execute(action)
    assert result.success is False
    assert "required" in (result.error or "")


def test_trigger_workflow_success():
    server, base_url = _make_server([(204, {})])
    adapter = _adapter(base_url)
    action = _action(
        action_type="github_trigger_workflow",
        owner="statis-ai",
        repo="core",
        workflow_id="deploy.yml",
        ref="main",
    )
    result = adapter.execute(action)
    assert result.success is True
    assert result.result["workflow_id"] == "deploy.yml"


def test_create_release_success():
    server, base_url = _make_server(
        [(201, {"id": 99, "html_url": "https://github.com/releases/99"})]
    )
    adapter = _adapter(base_url)
    action = _action(
        action_type="github_create_release",
        owner="statis-ai",
        repo="core",
        tag_name="v1.2.0",
    )
    result = adapter.execute(action)
    assert result.success is True
    assert result.result["release_id"] == 99
