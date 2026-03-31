"""Filesystem adapter — writes initiative brief markdown files atomically.

Action contract requirements:
  - ``action_type``: ``"write_initiative_brief"``
  - ``parameters.file_path``: absolute path to write the markdown file
  - ``parameters.title``: initiative title (string)
  - ``parameters.date``: date string (YYYY-MM-DD)
  - ``parameters.slug``: slug (must match YYYY-MM-DD-<slug> when combined with date)
  - ``parameters.summary``: plain-text summary paragraph
  - ``parameters.tasks``: dict mapping workstream name -> list of task strings

The action_id is embedded in the file as a machine-readable audit header so the
file can be traced back to the originating receipt without a DB query.

Idempotency: if the file already exists and the action_id header matches, the
adapter returns success without overwriting.  If the file exists with a
different action_id, it returns an error — the operator must resolve the
conflict manually.
"""
from __future__ import annotations

import os
import re
import tempfile
from typing import Any

from app.adapters.base import BaseAdapter, ExecutionResult

_SLUG_RE = re.compile(r"^\d{4}-\d{2}-\d{2}-.+$")


def _render_brief(action_id: str, params: dict) -> str:
    """Return the full markdown content for an initiative brief."""
    title: str = params.get("title", "")
    date: str = params.get("date", "")
    slug: str = params.get("slug", "")
    summary: str = params.get("summary", "")
    tasks: dict = params.get("tasks", {})

    lines: list[str] = [
        f"<!-- statis:action_id={action_id} -->",
        f"# {title}",
        "",
        f"**Date:** {date}",
        f"**Slug:** {slug}",
        "",
        "---",
        "",
        "## Summary",
        "",
        summary,
        "",
        "---",
        "",
        "## Tasks by Workstream",
        "",
    ]

    for workstream, task_list in tasks.items():
        lines.append(f"### {workstream.capitalize()}")
        lines.append("")
        if isinstance(task_list, list):
            for task in task_list:
                lines.append(f"- {task}")
        else:
            lines.append(f"- {task_list}")
        lines.append("")

    return "\n".join(lines)


class FilesystemAdapter(BaseAdapter):
    """Write initiative brief markdown files to the local filesystem.

    Safe to call more than once: re-execution with the same action_id is a
    no-op if the file already contains the matching statis:action_id header.

    ``allowed_prefix`` restricts all file writes to a specific directory tree.
    When set, any resolved ``file_path`` that falls outside the prefix raises
    an error before any I/O is attempted.  Defaults to the
    ``FILESYSTEM_ADAPTER_ALLOWED_PREFIX`` environment variable (or None, which
    disables the restriction for backward compatibility).
    """

    SUPPORTED_ACTION_TYPES = {"write_initiative_brief"}

    def __init__(self, allowed_prefix: str | None = None) -> None:
        self.allowed_prefix: str | None = (
            allowed_prefix
            if allowed_prefix is not None
            else os.getenv("FILESYSTEM_ADAPTER_ALLOWED_PREFIX")
        )

    def _check_allowed_prefix(self, file_path: str) -> None:
        """Raise ValueError if file_path resolves outside allowed_prefix."""
        if not self.allowed_prefix:
            return
        real_file = os.path.realpath(file_path)
        real_prefix = os.path.realpath(self.allowed_prefix)
        # Ensure the prefix ends with a separator so /allowed/prefix-extra
        # does not incorrectly match /allowed/prefix.
        if not real_prefix.endswith(os.sep):
            real_prefix += os.sep
        if not (real_file == real_prefix.rstrip(os.sep) or real_file.startswith(real_prefix)):
            raise ValueError(
                f"file_path '{file_path}' is outside allowed prefix '{self.allowed_prefix}'"
            )

    def execute(self, action: Any) -> ExecutionResult:
        action_id: str = (
            action.action_id if hasattr(action, "action_id") else action["action_id"]
        )
        action_type: str = (
            action.action_type
            if hasattr(action, "action_type")
            else action["action_type"]
        )
        parameters: dict = (
            action.parameters
            if hasattr(action, "parameters")
            else action.get("parameters", {})
        )

        if action_type not in self.SUPPORTED_ACTION_TYPES:
            return ExecutionResult(
                success=False,
                result={},
                error=f"FilesystemAdapter does not handle action_type={action_type!r}",
            )

        file_path: str = parameters.get("file_path", "")
        if not file_path:
            return ExecutionResult(
                success=False,
                result={},
                error="parameters.file_path is required for write_initiative_brief",
            )

        # Path traversal guard: reject writes outside the allowed prefix.
        try:
            self._check_allowed_prefix(file_path)
        except ValueError as exc:
            return ExecutionResult(
                success=False,
                result={},
                error=str(exc),
            )

        # Idempotency check: if file exists and matches this action_id, skip.
        expected_header = f"<!-- statis:action_id={action_id} -->"
        if os.path.isfile(file_path):
            try:
                with open(file_path, "r", encoding="utf-8") as fh:
                    first_line = fh.readline().rstrip("\n")
                if first_line == expected_header:
                    return ExecutionResult(
                        success=True,
                        result={
                            "file_path": file_path,
                            "status": "already_exists",
                            "action_id": action_id,
                        },
                    )
                else:
                    return ExecutionResult(
                        success=False,
                        result={},
                        error=(
                            f"File {file_path!r} already exists with a different "
                            f"action_id header. Resolve conflict manually."
                        ),
                    )
            except OSError as exc:
                return ExecutionResult(
                    success=False,
                    result={},
                    error=f"Could not read existing file {file_path!r}: {exc}",
                )

        # Ensure parent directory exists.
        parent = os.path.dirname(file_path)
        if parent:
            try:
                os.makedirs(parent, exist_ok=True)
            except OSError as exc:
                return ExecutionResult(
                    success=False,
                    result={},
                    error=f"Could not create directory {parent!r}: {exc}",
                )

        # Render content.
        content = _render_brief(action_id, parameters)

        # Write atomically: write to a temp file in the same directory, then
        # rename so partial writes are never visible.
        try:
            fd, tmp_path = tempfile.mkstemp(dir=parent or ".", suffix=".tmp")
            try:
                with os.fdopen(fd, "w", encoding="utf-8") as fh:
                    fh.write(content)
                os.replace(tmp_path, file_path)
            except Exception:
                try:
                    os.unlink(tmp_path)
                except OSError:
                    pass
                raise
        except OSError as exc:
            return ExecutionResult(
                success=False,
                result={},
                error=f"Could not write file {file_path!r}: {exc}",
            )

        return ExecutionResult(
            success=True,
            result={
                "file_path": file_path,
                "status": "written",
                "bytes_written": len(content.encode("utf-8")),
                "action_id": action_id,
            },
        )
