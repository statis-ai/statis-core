"use client";

import { useEffect, useState } from "react";
import { Command } from "cmdk";

const ITEMS = [
  { group: "Documentation", items: [
    { label: "Getting Started", href: "https://docs.statis.dev/getting-started", icon: "→" },
    { label: "API Reference", href: "https://docs.statis.dev/api", icon: "→" },
    { label: "Python SDK", href: "https://docs.statis.dev/sdk/python", icon: "→" },
    { label: "TypeScript SDK", href: "https://docs.statis.dev/sdk/typescript", icon: "→" },
    { label: "Self-host Guide", href: "https://docs.statis.dev/self-host", icon: "→" },
  ]},
  { group: "Product", items: [
    { label: "Console", href: "https://console.statis.dev", icon: "◆" },
    { label: "Changelog", href: "/changelog", icon: "◆" },
    { label: "Blog", href: "/blog", icon: "◆" },
  ]},
  { group: "Resources", items: [
    { label: "GitHub", href: "https://github.com/statis-ai/statis-sdk", icon: "⬡" },
    { label: "MCP Connectors", href: "/mcp", icon: "⬡" },
    { label: "Integrations", href: "/integrations", icon: "⬡" },
  ]},
];

export function CommandMenu() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(o => !o);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100]"
      style={{ background: "rgba(0,0,0,0.40)", backdropFilter: "blur(4px)" }}
      onClick={() => setOpen(false)}
    >
      <div
        className="mx-auto mt-[20vh] max-w-lg"
        onClick={e => e.stopPropagation()}
      >
        <Command
          className="rounded-xl overflow-hidden"
          style={{
            background: "var(--bg-elevated)",
            border: "1px solid var(--border)",
            borderTop: "1px solid rgba(249,115,22,0.30)",
            boxShadow: "0 24px 80px rgba(0,0,0,0.25), 0 0 40px rgba(249,115,22,0.06)",
          }}
        >
          <div
            className="flex items-center gap-3 px-4"
            style={{ borderBottom: "1px solid var(--border)" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <Command.Input
              placeholder="Search docs, pages, resources..."
              className="flex-1 py-3.5 text-sm bg-transparent outline-none placeholder:text-[var(--text-muted)]"
              style={{ color: "var(--text)" }}
              autoFocus
            />
            <kbd
              className="text-[10px] font-mono px-1.5 py-0.5 rounded"
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border)",
                color: "var(--text-muted)",
              }}
            >
              ESC
            </kbd>
          </div>

          <Command.List
            className="overflow-y-auto p-2"
            style={{ maxHeight: "320px" }}
          >
            <Command.Empty
              className="text-sm text-center py-8"
              style={{ color: "var(--text-muted)" }}
            >
              No results found.
            </Command.Empty>

            {ITEMS.map(group => (
              <Command.Group
                key={group.group}
                heading={group.group}
                className="mb-2"
              >
                <div
                  className="text-[9px] font-mono font-semibold uppercase tracking-[0.2em] px-3 py-2"
                  style={{ color: "var(--text-muted)" }}
                >
                  {group.group}
                </div>
                {group.items.map(item => (
                  <Command.Item
                    key={item.label}
                    value={item.label}
                    onSelect={() => {
                      setOpen(false);
                      if (item.href.startsWith("http")) {
                        window.open(item.href, "_blank");
                      } else {
                        window.location.href = item.href;
                      }
                    }}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm cursor-pointer transition-colors"
                    style={{ color: "var(--text)" }}
                    data-cmdk-item=""
                  >
                    <span
                      className="text-[10px] w-5 text-center shrink-0"
                      style={{ color: "var(--orange)", opacity: 0.7 }}
                    >
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </Command.Item>
                ))}
              </Command.Group>
            ))}
          </Command.List>
        </Command>
      </div>

      <style>{`
        [cmdk-group-heading] { display: none; }
        [data-cmdk-item][data-selected="true"] {
          background: rgba(249,115,22,0.08);
          color: var(--text);
        }
        [data-cmdk-item]:hover {
          background: rgba(249,115,22,0.06);
        }
      `}</style>
    </div>
  );
}
