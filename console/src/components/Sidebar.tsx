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
  Cpu,
  Plug,
  Radio,
  Settings,
  Users,
  ExternalLink,
  LogOut,
  KeyRound,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem =
  | { label: string; href: string; icon: React.ComponentType<{ size?: number; className?: string }> }
  | { label: string; href: string; icon: React.ComponentType<{ size?: number; className?: string }>; badge: number }
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
      { label: "Escalations", href: "/escalations", icon: AlertTriangle, badge: 2 },
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

  useEffect(() => {
    const stored = localStorage.getItem("statis_user_email");
    if (stored) setEmail(stored);
  }, []);

  function handleLogout() {
    localStorage.removeItem("statis_user_email");
    localStorage.removeItem("statis_api_key");
    localStorage.removeItem("statis_onboarding_complete");
    localStorage.removeItem("statis_onboarding_state");
    router.push("/auth");
  }

  return (
    <aside className="flex flex-col w-[220px] min-h-screen bg-[#0a0a0a] border-r border-[#1a1a1a] shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2 px-5 py-4 border-b border-[#1a1a1a]">
        <span className="text-[15px] font-bold tracking-tight text-white inline-flex items-center">
          statis
          <span className="inline-block ml-[1px] animate-pulse" style={{ width: "7px", height: "13px", background: "#ffffff" }} />
        </span>
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
                const linkProps = isExternal
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {};
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      {...linkProps}
                      className={cn(
                        "flex items-center gap-2.5 px-2.5 py-2 rounded text-sm transition-colors",
                        active
                          ? "bg-white/[0.06] text-[#d4d4d4] font-medium"
                          : "text-[#444444] hover:bg-white/[0.04] hover:text-[#888888]"
                      )}
                    >
                      <Icon
                        size={15}
                        className={active ? "text-[#d4d4d4]" : "text-[#444444]"}
                      />
                      <span className="flex-1">{item.label}</span>
                      {"badge" in item && item.badge ? (
                        <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-red-500/20 text-red-400 text-[10px] font-semibold">
                          {item.badge}
                        </span>
                      ) : null}
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
