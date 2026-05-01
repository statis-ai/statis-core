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
import { StatisMark } from "@/components/StatisMark";

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
    <aside className="flex flex-col w-[220px] min-h-screen bg-brand-bg border-r border-brand-rule shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2 px-5 py-4 border-b border-brand-rule">
        <span className="text-[15px] font-bold tracking-tight text-brand-ink inline-flex items-center gap-2 flex-1">
          <StatisMark size={22} barColor="var(--ink)" accentColor="var(--accent)" />
          statis
          <span
            className="ml-0.5 text-[9px] font-mono tracking-[0.12em] uppercase text-brand-muted border border-brand-rule rounded-sm px-1 py-px"
            style={{ borderRadius: "var(--radius-sm)" }}
          >
            BETA
          </span>
        </span>
        <button
          onClick={toggle}
          className="text-brand-muted hover:text-brand-accent transition-colors shrink-0"
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
              <p
                className="px-2 mb-1 font-mono uppercase text-brand-subtle"
                style={{ fontSize: "10px", letterSpacing: "0.18em" }}
              >
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
                        "relative flex items-center gap-2.5 px-2.5 py-2 text-sm transition-colors",
                        active
                          ? "bg-brand-accent-tint text-brand-ink font-medium"
                          : "text-brand-muted hover:bg-brand-deep hover:text-brand-ink"
                      )}
                      style={{ borderRadius: "var(--radius)" }}
                    >
                      {active && (
                        <span
                          className="active-indicator absolute left-0 top-1 bottom-1 w-[2px] rounded-full bg-brand-accent"
                        />
                      )}
                      <Icon
                        size={15}
                        className={active ? "text-brand-accent" : "text-brand-muted"}
                      />
                      <span className="flex-1">{item.label}</span>
                      {badgeCount > 0 && (
                        <span
                          className="flex items-center justify-center min-w-[18px] h-[18px] px-1 font-mono text-brand-bad border border-brand-bad"
                          style={{ fontSize: "10px", borderRadius: "var(--radius-sm)", background: "rgba(185,28,28,0.08)" }}
                        >
                          {badgeCount}
                        </span>
                      )}
                      {isExternal && (
                        <ExternalLink size={11} className="text-brand-muted" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Cmd+K hint */}
      <div className="px-3 pb-1">
        <div
          className="flex items-center justify-between px-2.5 py-1.5 border border-brand-rule text-brand-subtle cursor-pointer hover:border-brand-muted hover:text-brand-muted transition-colors"
          style={{ borderRadius: "var(--radius)", fontSize: "11px" }}
        >
          <span className="font-mono tracking-wide">Command palette</span>
          <span
            className="font-mono border border-brand-rule px-1 py-px text-brand-subtle"
            style={{ fontSize: "10px", borderRadius: "var(--radius-sm)" }}
          >
            ⌘K
          </span>
        </div>
      </div>

      {/* User footer */}
      <div className="px-3 py-3 border-t border-brand-rule">
        <div className="flex items-center gap-2.5 px-2.5 py-2" style={{ borderRadius: "var(--radius)" }}>
          <div
            className="w-7 h-7 flex items-center justify-center shrink-0 bg-brand-deep border border-brand-rule"
            style={{ borderRadius: "var(--radius-sm)" }}
          >
            <span className="text-brand-ink text-[11px] font-semibold font-mono">
              {email ? email[0].toUpperCase() : "?"}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-brand-muted truncate leading-tight">
              {email || ""}
            </p>
            <p className="text-brand-subtle leading-tight" style={{ fontSize: "10px" }}>Workspace</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-brand-muted hover:text-brand-accent transition-colors shrink-0"
            title="Sign out"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}
