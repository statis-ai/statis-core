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
import { COMMANDS } from "./commands";
import { SECTION_LABELS, type Command, type CommandContext } from "./types";

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
  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const ctx: CommandContext = useMemo(
    () => ({
      router: { push: (href: string) => router.push(href) },
      pathname: pathname ?? "/",
    }),
    [router, pathname],
  );

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
      requestAnimationFrame(() => {
        cmd.run(ctx);
      });
    },
    [onClose, ctx],
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

  let flatIdx = 0;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
    >
      <div
        className="absolute inset-0 bg-ink/30 backdrop-blur-[2px]"
        onClick={onClose}
      />

      <div className="relative w-full max-w-[580px] bg-paper border border-rule rounded-[4px] shadow-[0_1px_0_rgba(0,0,0,0.02),0_20px_40px_-12px_rgba(60,40,20,0.2)] overflow-hidden animate-palette-in">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-rule">
          <span className="font-mono text-[12px] text-ink-muted shrink-0">◎</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIdx(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search…"
            className="flex-1 bg-transparent font-sans text-[14px] text-ink placeholder:text-ink-muted tracking-[-0.005em] focus:outline-none"
            autoComplete="off"
            spellCheck={false}
          />
          <kbd className="hidden sm:inline-flex font-mono text-[9.5px] tracking-[0.1em] uppercase text-ink-muted border border-rule rounded-[2px] px-1.5 py-0.5">
            esc
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[54vh] overflow-y-auto py-1.5">
          {visible.length === 0 ? (
            <div className="px-4 py-12 text-center text-[12.5px] text-ink-muted tracking-[-0.005em]">
              No commands match &ldquo;{query}&rdquo;
            </div>
          ) : (
            Object.entries(SECTION_LABELS).map(([section, label]) => {
              const items = grouped[section];
              if (!items || items.length === 0) return null;
              return (
                <div key={section} className="mb-1 last:mb-0">
                  <div className="px-4 py-1.5 font-mono text-[9.5px] tracking-[0.14em] uppercase text-ink-muted font-medium">
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
                          className={
                            "w-full flex items-center gap-3 px-4 py-2 text-left transition-colors " +
                            (active ? "bg-bg" : "hover:bg-bg/60")
                          }
                        >
                          <span
                            className={
                              "flex items-center justify-center w-5 text-[13px] " +
                              (active ? "text-ink" : "text-ink-muted")
                            }
                          >
                            {cmd.icon}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div
                              className={
                                "text-[13px] truncate tracking-[-0.005em] " +
                                (active ? "text-ink" : "text-ink-soft")
                              }
                            >
                              {cmd.title}
                            </div>
                            {cmd.subtitle ? (
                              <div className="text-[11px] text-ink-muted truncate tracking-[-0.005em]">
                                {cmd.subtitle}
                              </div>
                            ) : null}
                          </div>
                          {cmd.shortcut ? (
                            <div className="flex items-center gap-1 shrink-0">
                              {cmd.shortcut.map((k, i) => (
                                <kbd
                                  key={`${cmd.id}-${i}`}
                                  className="font-mono text-[9.5px] tracking-[0.1em] uppercase text-ink-soft bg-bg border border-rule rounded-[2px] px-1.5 py-0.5"
                                >
                                  {k}
                                </kbd>
                              ))}
                            </div>
                          ) : null}
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
        <div className="flex items-center justify-between gap-4 px-4 py-2 border-t border-rule bg-bg">
          <div className="flex items-center gap-3 font-mono text-[9.5px] tracking-[0.1em] uppercase text-ink-muted">
            <span className="inline-flex items-center gap-1">
              <span>↑↓</span>
              <span>navigate</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <span>↵</span>
              <span>select</span>
            </span>
          </div>
          <span className="hidden sm:inline font-mono text-[9.5px] tracking-[0.1em] uppercase text-ink-muted">
            <kbd className="text-ink-soft bg-paper border border-rule rounded-[2px] px-1 mr-1">
              ?
            </kbd>
            shortcuts
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
