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
import { Search, ArrowUp, ArrowDown, CornerDownLeft } from "lucide-react";
import { COMMANDS } from "./commands";
import { SECTION_LABELS, type Command, type CommandContext } from "./types";
import { useTheme } from "@/components/ThemeProvider";

// Simple scoring: prefix match > word-boundary match > substring match.
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

  // Filter + score + group
  const { visible, grouped } = useMemo(() => {
    const scored = COMMANDS.filter((cmd) => (cmd.when ? cmd.when(ctx) : true))
      .map((cmd) => ({ cmd, s: score(cmd, query.trim()) }))
      .filter(({ s }) => s > 0)
      .sort((a, b) => b.s - a.s);

    const list = scored.map(({ cmd }) => cmd);

    const groups: Record<string, Command[]> = {};
    for (const cmd of list) {
      (groups[cmd.section] ??= []).push(cmd);
    }

    return { visible: list, grouped: groups };
  }, [query, ctx]);

  // Clamp active index when list changes
  useEffect(() => {
    if (activeIdx >= visible.length) setActiveIdx(0);
  }, [visible.length, activeIdx]);

  // Focus input on open, reset state on close
  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIdx(0);
      // Slight delay so focus doesn't fight with opening transition
      const t = window.setTimeout(() => inputRef.current?.focus(), 20);
      return () => window.clearTimeout(t);
    }
  }, [open]);

  // Scroll active into view
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const el = list.querySelector<HTMLElement>(`[data-idx="${activeIdx}"]`);
    if (el) el.scrollIntoView({ block: "nearest" });
  }, [activeIdx, query]);

  const run = useCallback(
    async (cmd: Command) => {
      onClose();
      // Give the close animation a frame to start before navigating
      requestAnimationFrame(() => {
        cmd.run(ctx);
      });
    },
    [onClose, ctx]
  );

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
      return;
    }
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

  // Build flat-index lookup so clicks and keyboard nav use the same index space
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
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="relative w-full max-w-[580px] rounded-lg shadow-2xl overflow-hidden animate-palette-in"
        style={{
          background: "var(--bg-surface)",
          color: "var(--text)",
          border: "1px solid var(--border)",
          boxShadow:
            "0 30px 60px -15px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.03)",
        }}
      >
        {/* Search input */}
        <div
          className="flex items-center gap-3 px-4 py-3"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <Search size={15} style={{ color: "var(--text-muted)" }} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIdx(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search…"
            className="flex-1 bg-transparent text-[14px] focus:outline-none"
            style={{ color: "var(--text)" }}
            autoComplete="off"
            spellCheck={false}
          />
          <kbd
            className="hidden sm:inline-flex text-[10px] px-1.5 py-0.5 rounded font-mono"
            style={{
              color: "var(--text-muted)",
              border: "1px solid var(--border)",
            }}
          >
            esc
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[54vh] overflow-y-auto py-2">
          {visible.length === 0 ? (
            <div
              className="px-4 py-12 text-center text-[12px]"
              style={{ color: "var(--text-muted)" }}
            >
              No commands match &ldquo;{query}&rdquo;
            </div>
          ) : (
            Object.entries(SECTION_LABELS).map(([section, label]) => {
              const items = grouped[section];
              if (!items || items.length === 0) return null;
              return (
                <div key={section} className="mb-2 last:mb-0">
                  <div
                    className="px-4 py-1.5 text-[9px] font-semibold uppercase tracking-widest"
                    style={{ color: "var(--text-muted)" }}
                  >
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
                            background: active
                              ? "color-mix(in srgb, var(--text) 8%, transparent)"
                              : "transparent",
                            color: active ? "var(--text)" : "var(--text-2)",
                          }}
                        >
                          <span
                            className="flex items-center justify-center w-6 h-6 rounded"
                            style={{
                              color: active
                                ? "var(--text)"
                                : "var(--text-muted)",
                            }}
                          >
                            {cmd.icon}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="text-[13px] truncate">
                              {cmd.title}
                            </div>
                            {cmd.subtitle && (
                              <div
                                className="text-[11px] truncate"
                                style={{ color: "var(--text-muted)" }}
                              >
                                {cmd.subtitle}
                              </div>
                            )}
                          </div>
                          {cmd.shortcut && (
                            <div className="flex items-center gap-1 shrink-0">
                              {cmd.shortcut.map((k, i) => (
                                <kbd
                                  key={`${cmd.id}-${i}`}
                                  className="text-[9px] px-1.5 py-0.5 rounded font-mono uppercase"
                                  style={{
                                    color: "var(--text-2)",
                                    border: "1px solid var(--border)",
                                    background:
                                      "color-mix(in srgb, var(--text) 4%, transparent)",
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
          className="flex items-center justify-between gap-4 px-4 py-2 text-[10px]"
          style={{
            borderTop: "1px solid var(--border)",
            color: "var(--text-muted)",
          }}
        >
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <ArrowUp size={10} />
              <ArrowDown size={10} />
              <span>navigate</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <CornerDownLeft size={10} />
              <span>select</span>
            </span>
          </div>
          <span className="hidden sm:inline">
            Press{" "}
            <kbd
              className="text-[9px] px-1 rounded"
              style={{
                color: "var(--text-2)",
                border: "1px solid var(--border)",
                background: "color-mix(in srgb, var(--text) 4%, transparent)",
              }}
            >
              ?
            </kbd>{" "}
            for shortcuts
          </span>
        </div>
      </div>

      <style jsx>{`
        @keyframes palette-in {
          from {
            opacity: 0;
            transform: translateY(-6px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-palette-in {
          animation: palette-in 140ms ease-out;
        }
      `}</style>
    </div>
  );
}
