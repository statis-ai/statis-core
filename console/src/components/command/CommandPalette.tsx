"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { Search, ArrowUp, ArrowDown, CornerDownLeft, Zap, Shield } from "lucide-react";
import { COMMANDS } from "./commands";
import { SECTION_LABELS, type Command, type CommandContext } from "./types";
import { useTheme } from "@/components/ThemeProvider";
import { fetchAllActions, fetchPolicyRules, type ActionContract, type PolicyRule } from "@/lib/api";

function score(cmd: Command, query: string): number {
  if (!query) return 1;
  const q = query.toLowerCase();
  const title = cmd.title.toLowerCase();
  const subtitle = (cmd.subtitle ?? "").toLowerCase();
  const keywords = (cmd.keywords ?? []).join(" ").toLowerCase();
  const haystack = `${title} ${subtitle} ${keywords}`;

  if (title.startsWith(q)) return 1000;
  if (title.includes(` ${q}`)) return 800;
  if (title.includes(q)) return 600;
  if (subtitle.includes(q)) return 400;
  if (haystack.includes(q)) return 200;
  return 0;
}

const iconProps = { size: 13 } as const;

function dynamicActionCommands(actions: ActionContract[]): Command[] {
  return actions.map((a) => ({
    id: `action-${a.action_id}`,
    title: a.action_id.slice(0, 20),
    subtitle: `${a.action_type} · ${a.status}`,
    section: "actions" as const,
    icon: <Zap {...iconProps} />,
    keywords: [a.action_type, a.proposed_by, a.status, a.action_id],
    run: ({ router }) => router.push(`/actions/${a.action_id}`),
  }));
}

function dynamicPolicyCommands(rules: PolicyRule[]): Command[] {
  return rules.map((r) => ({
    id: `policy-${r.rule_id}`,
    title: r.rule_id,
    subtitle: `${r.action_type} · ${r.decision}`,
    section: "policies" as const,
    icon: <Shield {...iconProps} />,
    keywords: [r.action_type, r.decision, r.rule_id, r.description ?? ""],
    run: ({ router }) => router.push(`/policies/${r.rule_id}`),
  }));
}

export function CommandPalette({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { toggle: toggleTheme } = useTheme();
  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const [dynamicActions, setDynamicActions] = useState<ActionContract[]>([]);
  const [dynamicPolicies, setDynamicPolicies] = useState<PolicyRule[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const ctx: CommandContext = useMemo(
    () => ({
      router: { push: (href: string) => router.push(href) },
      pathname: pathname ?? "/",
      toggleTheme,
    }),
    [router, pathname, toggleTheme]
  );

  // Fetch dynamic data when palette opens
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    async function load() {
      try {
        const [actions, policies] = await Promise.allSettled([
          fetchAllActions({ limit: 50 }),
          fetchPolicyRules(),
        ]);
        if (cancelled) return;
        if (actions.status === "fulfilled") setDynamicActions(actions.value);
        if (policies.status === "fulfilled") setDynamicPolicies(policies.value);
      } catch { /* silently fail — palette still works for static commands */ }
    }
    load();
    return () => { cancelled = true; };
  }, [open]);

  // Merge static + dynamic commands
  const allCommands: Command[] = useMemo(() => [
    ...COMMANDS,
    ...dynamicActionCommands(dynamicActions),
    ...dynamicPolicyCommands(dynamicPolicies),
  ], [dynamicActions, dynamicPolicies]);

  const { visible, grouped } = useMemo(() => {
    const q = query.trim();
    // When query is empty, show only static nav/create/theme commands
    const pool = q ? allCommands : COMMANDS;
    const scored = pool
      .filter((cmd) => (cmd.when ? cmd.when(ctx) : true))
      .map((cmd) => ({ cmd, s: score(cmd, q) }))
      .filter(({ s }) => s > 0)
      .sort((a, b) => b.s - a.s);

    const list = scored.map(({ cmd }) => cmd);

    const groups: Record<string, Command[]> = {};
    for (const cmd of list) {
      (groups[cmd.section] ??= []).push(cmd);
    }

    return { visible: list, grouped: groups };
  }, [query, ctx, allCommands]);

  useEffect(() => {
    if (activeIdx >= visible.length) setActiveIdx(0);
  }, [visible.length, activeIdx]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIdx(0);
      const t = window.setTimeout(() => inputRef.current?.focus(), 20);
      return () => window.clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const el = list.querySelector<HTMLElement>(`[data-idx="${activeIdx}"]`);
    if (el) el.scrollIntoView({ block: "nearest" });
  }, [activeIdx, query]);

  const run = useCallback(
    async (cmd: Command) => {
      onClose();
      requestAnimationFrame(() => { cmd.run(ctx); });
    },
    [onClose, ctx]
  );

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") { e.preventDefault(); onClose(); return; }
    if (e.key === "ArrowDown" || (e.ctrlKey && e.key === "j")) {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, Math.max(visible.length - 1, 0)));
      return;
    }
    if (e.key === "ArrowUp" || (e.ctrlKey && e.key === "k")) {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      const cmd = visible[activeIdx];
      if (cmd) run(cmd);
    }
  };

  if (!open) return null;

  let flatIdx = 0;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 backdrop-blur-sm"
        style={{ background: "rgba(0,0,0,0.35)" }}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="relative w-full max-w-[600px] overflow-hidden animate-palette-in"
        style={{
          background: "var(--paper)",
          color: "var(--ink)",
          border: "1px solid var(--rule)",
          borderRadius: "var(--radius-lg)",
          boxShadow: "var(--tw-shadow, 0 30px 60px -15px rgba(60,40,20,0.22))",
        }}
      >
        {/* Search input */}
        <div
          className="flex items-center gap-3 px-4 py-3"
          style={{ borderBottom: "1px solid var(--rule)" }}
        >
          <Search size={15} style={{ color: "var(--ink-muted)" }} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIdx(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command, action ID, or policy name…"
            className="flex-1 bg-transparent focus:outline-none font-sans"
            style={{ fontSize: 14, color: "var(--ink)" }}
            autoComplete="off"
            spellCheck={false}
          />
          <kbd
            className="hidden sm:inline-flex font-mono"
            style={{
              fontSize: 10,
              padding: "2px 6px",
              color: "var(--ink-muted)",
              border: "1px solid var(--rule)",
              borderRadius: "var(--radius-sm)",
            }}
          >
            esc
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[54vh] overflow-y-auto py-2">
          {visible.length === 0 ? (
            <div
              className="px-4 py-12 text-center font-mono"
              style={{ color: "var(--ink-muted)", fontSize: 12 }}
            >
              No results for &ldquo;{query}&rdquo;
            </div>
          ) : (
            Object.entries(SECTION_LABELS).map(([section, label]) => {
              const items = grouped[section];
              if (!items || items.length === 0) return null;
              return (
                <div key={section} className="mb-2 last:mb-0">
                  {/* Section eyebrow */}
                  <div
                    className="flex items-center gap-3 px-4 py-1.5 font-mono uppercase"
                    style={{ fontSize: 10, letterSpacing: "0.18em", color: "var(--ink-muted)" }}
                  >
                    <span
                      style={{
                        display: "inline-block",
                        width: 16,
                        height: 1,
                        background: "var(--accent)",
                        flexShrink: 0,
                      }}
                    />
                    {label}
                  </div>
                  <div>
                    {items.map((cmd) => {
                      const idx = flatIdx++;
                      const active = idx === activeIdx;
                      return (
                        <button
                          key={cmd.id}
                          type="button"
                          data-idx={idx}
                          onMouseEnter={() => setActiveIdx(idx)}
                          onClick={() => run(cmd)}
                          className="w-full flex items-center gap-3 px-4 py-2 text-left transition-colors"
                          style={{
                            background: active ? "var(--accent-tint)" : "transparent",
                            color: active ? "var(--accent)" : "var(--ink-soft)",
                            borderLeft: active ? "2px solid var(--accent)" : "2px solid transparent",
                          }}
                        >
                          <span
                            className="flex items-center justify-center w-5 h-5 shrink-0"
                            style={{ color: active ? "var(--accent)" : "var(--ink-muted)" }}
                          >
                            {cmd.icon}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="font-mono truncate" style={{ fontSize: 13 }}>
                              {cmd.title}
                            </div>
                            {cmd.subtitle && (
                              <div
                                className="font-mono truncate"
                                style={{ fontSize: 11, color: active ? "var(--accent)" : "var(--ink-muted)", opacity: 0.8 }}
                              >
                                {cmd.subtitle}
                              </div>
                            )}
                          </div>
                          {cmd.shortcut && cmd.shortcut.length > 0 && (
                            <div className="flex items-center gap-1 shrink-0">
                              {cmd.shortcut.map((k, i) => (
                                <kbd
                                  key={`${cmd.id}-${i}`}
                                  className="font-mono uppercase"
                                  style={{
                                    fontSize: 9,
                                    padding: "2px 5px",
                                    color: "var(--ink-muted)",
                                    border: "1px solid var(--rule)",
                                    borderRadius: "var(--radius-sm)",
                                    background: "var(--bg-deep)",
                                  }}
                                >
                                  {k}
                                </kbd>
                              ))}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between gap-4 px-4 py-2 font-mono"
          style={{
            borderTop: "1px solid var(--rule)",
            fontSize: 10,
            color: "var(--ink-muted)",
          }}
        >
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <ArrowUp size={10} />
              <ArrowDown size={10} />
              navigate
            </span>
            <span className="inline-flex items-center gap-1">
              <CornerDownLeft size={10} />
              select
            </span>
          </div>
          <span className="hidden sm:inline text-brand-muted">
            Type to search actions &amp; policies
          </span>
        </div>
      </div>

      <style jsx>{`
        @keyframes palette-in {
          from { opacity: 0; transform: translateY(-6px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-palette-in { animation: palette-in 140ms ease-out; }
      `}</style>
    </div>
  );
}
