"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, type Env } from "@/lib/session";
import { fetchEscalations } from "@/lib/api";

type BadgeKey = "agents-live" | "approvals";

type NavItem = {
  label: string;
  href: string;
  ico: string;
  badgeKey?: BadgeKey;
  external?: boolean;
  kbd?: string;
};

type NavGroup = { label: string; items: NavItem[] };

const OPERATE: NavGroup = {
  label: "Operate",
  items: [
    { label: "Home", href: "/home", ico: "◇" },
    { label: "Agents", href: "/agents", ico: "◆", badgeKey: "agents-live" },
    { label: "Receipts", href: "/receipts", ico: "◈" },
    { label: "Approvals", href: "/escalations", ico: "◉", badgeKey: "approvals" },
    { label: "Broadcast", href: "/broadcast", ico: "◎" },
    { label: "Insights", href: "/insights", ico: "◌" },
  ],
};

const GOVERN: NavGroup = {
  label: "Govern",
  items: [
    { label: "Policies", href: "/policies", ico: "▤" },
    { label: "Teams", href: "/team", ico: "▥" },
  ],
};

const BUILD: NavGroup = {
  label: "Build",
  items: [{ label: "Developer", href: "/developers", ico: "⌘" }],
};

const ACCOUNT: NavItem[] = [
  { label: "Settings", href: "/settings", ico: "⚙" },
  { label: "Docs & help", href: "https://docs.statis.dev", ico: "?", external: true },
  { label: "Command", href: "#cmdk", ico: "⌥", kbd: "⌘K" },
];

function OrgMark() {
  return (
    <svg viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg" className="w-full h-full block">
      <rect x="20" y="40" width="40" height="180" fill="#111111" />
      <rect x="180" y="40" width="40" height="180" fill="#111111" />
      <rect x="110" y="40" width="110" height="30" fill="#b8442e" />
      <rect x="110" y="200" width="20" height="20" fill="#111111" />
    </svg>
  );
}

function NavRow({ item, active, badge }: { item: NavItem; active: boolean; badge?: { count: number; urgent?: boolean; live?: boolean } }) {
  const base = "relative flex items-center gap-2.5 px-2.5 py-1.5 rounded-[3px] text-[13px] tracking-[-0.005em] cursor-pointer transition-colors";
  const stateCls = active
    ? "bg-paper text-ink font-medium shadow-[inset_2px_0_0_var(--accent)]"
    : "text-ink-soft hover:bg-bg-deep hover:text-ink";

  const content = (
    <>
      <span className={`w-3.5 h-3.5 shrink-0 flex items-center justify-center font-mono text-[13px] ${active ? "text-accent" : "text-ink-muted"}`}>
        {item.ico}
      </span>
      <span className="flex-1 truncate">{item.label}</span>
      {badge && badge.count > 0 && (
        <span
          className={
            "font-mono text-[10px] px-1.5 py-[1px] rounded-[2px] tracking-wider border " +
            (badge.urgent
              ? "text-accent border-accent bg-[rgba(184,68,46,0.06)] font-medium"
              : "text-ink-muted border-rule bg-bg-deep")
          }
        >
          {badge.live && (
            <span className="inline-block w-[5px] h-[5px] rounded-full bg-seal mr-1 align-middle animate-[pulse-dot_2s_ease-out_infinite]" />
          )}
          {badge.live ? `${badge.count} live` : badge.count}
        </span>
      )}
      {item.kbd && (
        <span className="font-mono text-[10px] px-1.5 py-[1px] rounded-[2px] tracking-wider border text-ink-muted border-rule bg-bg-deep">
          {item.kbd}
        </span>
      )}
    </>
  );

  if (item.external) {
    return (
      <a href={item.href} target="_blank" rel="noopener noreferrer" className={`${base} ${stateCls}`}>
        {content}
      </a>
    );
  }
  if (item.href.startsWith("#")) {
    return (
      <button type="button" className={`${base} ${stateCls} w-full text-left`}>
        {content}
      </button>
    );
  }
  return (
    <Link href={item.href} className={`${base} ${stateCls}`}>
      {content}
    </Link>
  );
}

export default function Sidebar() {
  const pathname = usePathname() || "";
  const { org, env, setEnv } = useSession();
  const [approvalCount, setApprovalCount] = useState(0);
  const [liveAgentCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await fetchEscalations();
        if (!cancelled) setApprovalCount(data.length);
      } catch {
        /* ignore */
      }
    }
    load();
    const id = setInterval(load, 30_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const badges: Record<BadgeKey, { count: number; urgent?: boolean; live?: boolean }> = {
    "agents-live": { count: liveAgentCount, live: true },
    approvals: { count: approvalCount, urgent: true },
  };

  function isActive(href: string) {
    if (href === "/home") return pathname === "/home" || pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  }

  const groups = [OPERATE, GOVERN, BUILD];

  return (
    <aside className="flex flex-col w-[240px] shrink-0 bg-bg border-r border-rule min-h-screen">
      {/* Top — org + env */}
      <div className="px-3.5 pt-3.5 pb-3.5 border-b border-rule mb-3">
        <button
          type="button"
          className="w-full flex items-center gap-2 px-2.5 py-2 bg-paper border border-rule rounded-[3px] text-left hover:bg-bg-deep/30 transition-colors"
        >
          <span className="w-[18px] h-[18px] flex items-center justify-center shrink-0">
            <OrgMark />
          </span>
          <span className="flex-1 min-w-0 truncate font-sans font-medium text-[13px] tracking-[-0.01em] text-ink">
            {org.name}
          </span>
          <span className="font-mono text-[10px] text-ink-muted">⌄</span>
        </button>

        <div className="flex mt-2.5 border border-rule rounded-[3px] overflow-hidden bg-paper">
          {(["prod", "staging", "dev"] as Env[]).map((e, i) => {
            const active = env === e;
            return (
              <button
                key={e}
                type="button"
                onClick={() => setEnv(e)}
                className={
                  "flex-1 px-1 py-[5px] font-mono text-[10px] tracking-widest uppercase transition-colors " +
                  (active ? "bg-ink text-paper font-medium" : "text-ink-muted hover:text-ink") +
                  (i < 2 ? " border-r border-rule" : "")
                }
              >
                {e}
              </button>
            );
          })}
        </div>
      </div>

      {/* Nav groups */}
      <nav className="flex-1 overflow-y-auto">
        {groups.map((group) => (
          <div key={group.label} className="px-2 pb-3.5 pt-1">
            <div className="px-2.5 pt-2 pb-1.5 font-mono text-[9.5px] tracking-[0.16em] uppercase text-ink-muted flex justify-between items-center">
              <span>{group.label}</span>
              <span className="font-normal">{group.items.length}</span>
            </div>
            <ul className="space-y-0.5">
              {group.items.map((item) => (
                <li key={item.href}>
                  <NavRow
                    item={item}
                    active={isActive(item.href)}
                    badge={item.badgeKey ? badges[item.badgeKey] : undefined}
                  />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Account footer */}
      <div className="mt-auto px-3.5 pt-3 border-t border-rule flex flex-col gap-1 pb-4">
        {ACCOUNT.map((item) => (
          <NavRow key={item.href} item={item} active={isActive(item.href)} />
        ))}
      </div>
    </aside>
  );
}
