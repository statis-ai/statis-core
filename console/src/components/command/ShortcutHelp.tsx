"use client";

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
        className="absolute inset-0 bg-ink/30 backdrop-blur-[2px]"
        onClick={onClose}
      />

      <div className="relative w-full max-w-[680px] max-h-[80vh] overflow-y-auto bg-paper border border-rule rounded-[4px] shadow-[0_1px_0_rgba(0,0,0,0.02),0_20px_40px_-12px_rgba(60,40,20,0.2)]">
        <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-rule bg-bg">
          <div>
            <h2 className="font-sans text-[15px] text-ink tracking-[-0.015em] font-medium">
              Keyboard shortcuts
            </h2>
            <p className="text-[11.5px] text-ink-muted tracking-[-0.005em] mt-0.5">
              Navigate the Statis console without touching your mouse.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="font-mono text-[14px] text-ink-muted hover:text-ink transition-colors leading-none"
          >
            ×
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-7 px-5 py-6">
          {GROUPS.map((group) => (
            <section key={group.title}>
              <h3 className="font-mono text-[9.5px] tracking-[0.14em] uppercase text-ink-muted font-medium mb-3">
                {group.title}
              </h3>
              <ul className="space-y-2">
                {group.items.map((item) => (
                  <li
                    key={item.label}
                    className="flex items-center justify-between gap-4 text-[12.5px]"
                  >
                    <span className="text-ink-soft tracking-[-0.005em]">
                      {item.label}
                    </span>
                    <span className="flex items-center gap-1 shrink-0">
                      {item.keys.map((k, i) => (
                        <kbd
                          key={`${item.label}-${i}`}
                          className="font-mono text-[9.5px] tracking-[0.1em] uppercase text-ink bg-bg border border-rule rounded-[2px] px-1.5 py-0.5 min-w-[20px] text-center"
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

        <div className="px-5 py-3 border-t border-rule bg-bg font-mono text-[10.5px] tracking-[0.02em] text-ink-muted">
          Tip: press{" "}
          <kbd className="font-mono text-[9.5px] tracking-[0.1em] uppercase text-ink-soft bg-paper border border-rule rounded-[2px] px-1.5 py-0.5 mx-0.5">
            ⌘K
          </kbd>{" "}
          to search all commands.
        </div>
      </div>
    </div>
  );
}
