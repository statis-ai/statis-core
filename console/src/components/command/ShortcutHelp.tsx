"use client";

import { X } from "lucide-react";

type ShortcutGroup = {
  title: string;
  items: { label: string; keys: string[] }[];
};

const GROUPS: ShortcutGroup[] = [
  {
    title: "General",
    items: [
      { label: "Open command palette", keys: ["⌘", "K"] },
      { label: "Open command palette (alt)", keys: ["Ctrl", "K"] },
      { label: "Show this shortcuts help", keys: ["?"] },
      { label: "Close dialog / exit mode", keys: ["Esc"] },
    ],
  },
  {
    title: "Navigation",
    items: [
      { label: "Go to Home", keys: ["g", "h"] },
      { label: "Go to Actions", keys: ["g", "a"] },
      { label: "Go to Escalations", keys: ["g", "e"] },
      { label: "Go to Policies", keys: ["g", "p"] },
      { label: "Go to Adapters", keys: ["g", "c"] },
      { label: "Go to Receipts", keys: ["g", "r"] },
    ],
  },
  {
    title: "Create",
    items: [
      { label: "New policy rule", keys: ["c", "p"] },
      { label: "Register agent", keys: ["c", "a"] },
      { label: "Add connector", keys: ["c", "c"] },
    ],
  },
  {
    title: "Lists & tables",
    items: [
      { label: "Move down", keys: ["j"] },
      { label: "Move up", keys: ["k"] },
      { label: "Focus search", keys: ["/"] },
      { label: "Edit selected", keys: ["e"] },
    ],
  },
];

export function ShortcutHelp({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard shortcuts"
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        className="relative w-full max-w-[680px] max-h-[80vh] overflow-y-auto rounded-lg shadow-2xl"
        style={{
          background: "var(--bg-surface)",
          color: "var(--text)",
          border: "1px solid var(--border)",
          boxShadow:
            "0 30px 60px -15px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.03)",
        }}
      >
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <div>
            <h2
              className="text-[14px] font-semibold"
              style={{ color: "var(--text)" }}
            >
              Keyboard shortcuts
            </h2>
            <p
              className="text-[11px] mt-0.5"
              style={{ color: "var(--text-muted)" }}
            >
              Navigate the Statis console without touching your mouse.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="transition-colors"
            style={{ color: "var(--text-muted)" }}
          >
            <X size={16} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8 px-6 py-6">
          {GROUPS.map((group) => (
            <section key={group.title}>
              <h3
                className="text-[10px] font-semibold uppercase tracking-widest mb-3"
                style={{ color: "var(--text-muted)" }}
              >
                {group.title}
              </h3>
              <ul className="space-y-2">
                {group.items.map((item) => (
                  <li
                    key={item.label}
                    className="flex items-center justify-between gap-4 text-[12px]"
                  >
                    <span style={{ color: "var(--text-2)" }}>{item.label}</span>
                    <span className="flex items-center gap-1 shrink-0">
                      {item.keys.map((k, i) => (
                        <kbd
                          key={`${item.label}-${i}`}
                          className="text-[10px] px-1.5 py-0.5 rounded font-mono min-w-[20px] text-center"
                          style={{
                            color: "var(--text)",
                            border: "1px solid var(--border)",
                            background:
                              "color-mix(in srgb, var(--text) 4%, transparent)",
                          }}
                        >
                          {k}
                        </kbd>
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <div
          className="px-6 py-3 text-[10px]"
          style={{
            borderTop: "1px solid var(--border)",
            color: "var(--text-muted)",
          }}
        >
          Tip: press{" "}
          <kbd
            className="text-[10px] px-1.5 py-0.5 rounded font-mono"
            style={{
              color: "var(--text-2)",
              border: "1px solid var(--border)",
              background: "color-mix(in srgb, var(--text) 4%, transparent)",
            }}
          >
            ⌘K
          </kbd>{" "}
          to search all commands.
        </div>
      </div>
    </div>
  );
}
