"""MCP tool call adapter.

Phase 2: Proxies real MCP tool calls via JSON-RPC 2.0 to the target MCP server.
Falls back to audit-only mode if `mcp_server` is not an HTTP URL (e.g. a bare
server name like "filesystem") — this preserves backward compat with Phase 1
agents that only set a symbolic server name.

Expected action.parameters shape:
    {
        "tool_name":  "read_file",
        "tool_input": {"path": "/tmp/report.txt"},
        "mcp_server": "http://localhost:3001"   # HTTP URL → real proxy
                   or "filesystem"              # bare name → audit-only
    }

MCP JSON-RPC 2.0 request format (tools/call):
    POST {mcp_server}
    {"jsonrpc": "2.0", "id": 1, "method": "tools/call",
     "params": {"name": tool_name, "arguments": tool_input}}

Response success shape:
    {"jsonrpc": "2.0", "id": 1, "result": {"content": [...]}}

Response error shape:
    {"jsonrpc": "2.0", "id": 1, "error": {"code": -32600, "message": "..."}}
"""

import logging
from datetime import datetime, timezone

import httpx

from app.adapters.base import BaseAdapter, ExecutionResult

logger = logging.getLogger(__name__)

_TIMEOUT = 30.0  # seconds — MCP servers may do meaningful work


class MCPAdapter(BaseAdapter):
    def execute(self, action) -> ExecutionResult:
        tool_name = action.parameters.get("tool_name", "unknown")
        tool_input = action.parameters.get("tool_input", {})
        mcp_server = action.parameters.get("mcp_server", "")

        # If mcp_server is not an HTTP URL, fall back to audit-only mode.
        if not isinstance(mcp_server, str) or not mcp_server.startswith(("http://", "https://")):
            logger.info(
                "MCP audit (no URL): action_id=%s tool=%s server=%s input_keys=%s",
                action.action_id,
                tool_name,
                mcp_server,
                list(tool_input.keys()) if isinstance(tool_input, dict) else [],
            )
            return ExecutionResult(
                success=True,
                result={
                    "mode": "audit",
                    "tool_name": tool_name,
                    "mcp_server": mcp_server,
                    "audited_at": datetime.now(timezone.utc).isoformat(),
                },
            )

        # Phase 2: real proxy via JSON-RPC 2.0
        payload = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "tools/call",
            "params": {
                "name": tool_name,
                "arguments": tool_input if isinstance(tool_input, dict) else {},
            },
        }

        logger.info(
            "MCP proxy: action_id=%s tool=%s server=%s",
            action.action_id,
            tool_name,
            mcp_server,
        )

        try:
            resp = httpx.post(
                mcp_server,
                json=payload,
                timeout=_TIMEOUT,
                headers={
                    "Content-Type": "application/json",
                    "X-Statis-Action-Id": str(action.action_id),
                },
            )
            resp.raise_for_status()
        except httpx.TimeoutException:
            return ExecutionResult(
                success=False,
                error=f"MCP server timed out after {_TIMEOUT}s (tool={tool_name})",
            )
        except httpx.HTTPStatusError as exc:
            return ExecutionResult(
                success=False,
                error=f"MCP server returned HTTP {exc.response.status_code}",
            )
        except Exception as exc:
            return ExecutionResult(
                success=False,
                error=f"MCP proxy error: {exc}",
            )

        try:
            body = resp.json()
        except Exception:
            return ExecutionResult(
                success=False,
                error="MCP server returned non-JSON response",
            )

        if "error" in body:
            err = body["error"]
            msg = err.get("message", str(err)) if isinstance(err, dict) else str(err)
            return ExecutionResult(success=False, error=msg)

        return ExecutionResult(
            success=True,
            result={
                "mode": "proxy",
                "tool_name": tool_name,
                "mcp_server": mcp_server,
                "content": body.get("result", {}).get("content", []),
                "raw": body.get("result"),
            },
        )
