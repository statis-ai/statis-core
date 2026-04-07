"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Zap,
  FileText,
  Database,
  Activity,
  Shield,
  AlertTriangle,
  ShieldOff,
  AlertOctagon,
  Cpu,
  Plug,
  Radio,
  Settings,
  Users,
  ExternalLink,
  LogOut,
  KeyRound,
  Sun,
  Moon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchEscalations } from "@/lib/api";
import { useTheme } from "@/components/ThemeProvider";

type NavItem =
  | { label: string; href: string; icon: React.ComponentType<{ size?: number; className?: string }> }
  | { label: string; href: string; icon: React.ComponentType<{ size?: number; className?: string }>; badgeKey: "escalations" }
  | { label: string; href: string; icon: React.ComponentType<{ size?: number; className?: string }>; external: true };

type NavSection = { group?: string; items: NavItem[] };

const NAV: NavSection[] = [
  {
    items: [{ label: "Home", href: "/home", icon: Home }],
  },
  {
    group: "Observe",
    items: [
      { label: "Actions", href: "/actions", icon: Zap },
      { label: "Receipts", href: "/receipts", icon: FileText },
      { label: "Entities", href: "/entities", icon: Database },
      { label: "Events", href: "/events", icon: Activity },
    ],
  },
  {
    group: "Govern",
    items: [
      { label: "Policies", href: "/policies", icon: Shield },
      { label: "Escalations", href: "/escalations", icon: AlertTriangle, badgeKey: "escalations" },
      { label: "Kill Switch", href: "/kill-switch", icon: ShieldOff },
      { label: "Threat Logs", href: "/threat-logs", icon: AlertOctagon },
    ],
  },
  {
    group: "Connect",
    items: [
      { label: "Agents", href: "/agents", icon: Cpu },
      { label: "Adapters", href: "/adapters", icon: Plug },
      { label: "Webhooks", href: "/webhooks", icon: Radio },
    ],
  },
  {
    group: "Account",
    items: [
      { label: "Settings", href: "/settings", icon: Settings },
      { label: "Developers", href: "/developers", icon: KeyRound },
      { label: "Team", href: "/team", icon: Users },
      {
        label: "Docs",
        href: "https://docs.statis.dev",
        icon: ExternalLink,
        external: true,
      },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [escalationCount, setEscalationCount] = useState(0);

  useEffect(() => {
    const stored = localStorage.getItem("statis_user_email");
    if (stored) setEmail(stored);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadCount() {
      try {
        const data = await fetchEscalations();
        if (!cancelled) setEscalationCount(data.length);
      } catch {
        // silently ignore — badge just won't show
      }
    }

    loadCount();
    const interval = setInterval(loadCount, 30_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  function handleLogout() {
    localStorage.removeItem("statis_user_email");
    localStorage.removeItem("statis_api_key");
    localStorage.removeItem("statis_onboarding_complete");
    localStorage.removeItem("statis_onboarding_state");
    router.push("/auth");
  }

  const { theme, toggle } = useTheme();

  const badges: Record<string, number> = {
    escalations: escalationCount,
  };

  return (
    <aside className="flex flex-col w-[220px] min-h-screen bg-[#0a0a0a] border-r border-[#1a1a1a] shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2 px-5 py-4 border-b border-[#1a1a1a]">
        <span className="text-[15px] font-bold tracking-tight text-white inline-flex items-center gap-2 flex-1">
          <svg width="18" height="18" viewBox="0 0 100 100" fill="none" aria-hidden="true">
            <rect x="45.5" y="11" width="9" height="41" rx="4.5" fill="#F0EDE8" transform="rotate(0 50 50)" />
            <rect x="45.5" y="11" width="9" height="41" rx="4.5" fill="#F0EDE8" transform="rotate(60 50 50)" opacity="0.78" />
            <rect x="45.5" y="11" width="9" height="41" rx="4.5" fill="#F0EDE8" transform="rotate(120 50 50)" opacity="0.56" />
            <rect x="45.5" y="11" width="9" height="41" rx="4.5" fill="#F0EDE8" transform="rotate(180 50 50)" opacity="0.78" />
            <rect x="45.5" y="11" width="9" height="41" rx="4.5" fill="#F0EDE8" transform="rotate(240 50 50)" opacity="0.56" />
            <rect x="45.5" y="11" width="9" height="41" rx="4.5" fill="#F0EDE8" transform="rotate(300 50 50)" opacity="0.78" />
            <circle cx="50" cy="50" r="15" fill="#c85c1a" opacity="0.28" />
            <circle cx="50" cy="50" r="12" fill="#c85c1a" />
            <circle cx="50" cy="50" r="3.5" fill="#F9C09A" />
          </svg>
          statis
        </span>
        <button
          onClick={toggle}
          className="text-[#444444] hover:text-[#888888] transition-colors shrink-0"
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {NAV.map((section, i) => (
          <div key={i}>
            {section.group && (
              <p className="px-2 mb-1 text-[10px] font-semibold tracking-widest text-[#444444] uppercase">
                {section.group}
              </p>
            )}
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active = pathname === item.href || pathname.startsWith(item.href + "/");
                const Icon = item.icon;
                const isExternal = "external" in item && item.external;
                const badgeCount = "badgeKey" in item ? (badges[item.badgeKey] ?? 0) : 0;
                const linkProps = isExternal
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {};
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      {...linkProps}
                      className={cn(
                        "relative flex items-center gap-2.5 px-2.5 py-2 rounded text-sm transition-colors",
                        active
                          ? "bg-white/[0.06] text-[#d4d4d4] font-medium"
                          : "text-[#444444] hover:bg-white/[0.04] hover:text-[#888888]"
                      )}
                    >
                      {active && (
                        <span className="active-indicator absolute left-0 top-1 bottom-1 w-[2px] rounded-full bg-white" />
                      )}
                      <Icon
                        size={15}
                        className={active ? "text-[#d4d4d4]" : "text-[#444444]"}
                      />
                      <span className="flex-1">{item.label}</span>
                      {badgeCount > 0 && (
                        <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-red-500/20 text-red-400 text-[10px] font-semibold">
                          {badgeCount}
                        </span>
                      )}
                      {isExternal && (
                        <ExternalLink size={11} className="text-[#444444]" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="px-3 py-3 border-t border-[#1a1a1a]">
        <div className="flex items-center gap-2.5 px-2.5 py-2 rounded">
          <div className="w-7 h-7 rounded bg-[#1a1a1a] flex items-center justify-center shrink-0">
            <span className="text-white text-[11px] font-semibold">
              {email ? email[0].toUpperCase() : "?"}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-[#888888] truncate leading-tight">
              {email || ""}
            </p>
            <p className="text-[10px] text-[#444444] leading-tight">Workspace</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-[#444444] hover:text-[#888888] transition-colors shrink-0"
            title="Sign out"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}
