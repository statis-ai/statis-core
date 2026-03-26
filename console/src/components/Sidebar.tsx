"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
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

  function handleLogout() {
    localStorage.removeItem("statis_user_email");
    localStorage.removeItem("statis_api_key");
    router.push("/auth");
  }

  return (
    <aside className="flex flex-col w-[220px] min-h-screen bg-[#08080f] border-r border-white/[0.06] shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-white/5">
        <Image
          src="/logomark-transparent.png"
          alt="Statis"
          width={28}
          height={28}
          className="shrink-0"
          style={{ filter: "drop-shadow(0 0 6px rgba(0,255,200,0.45))" }}
        />
        <span className="text-[15px] font-semibold tracking-tight font-serif text-gradient">
          Statis
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {NAV.map((section, i) => (
          <div key={i}>
            {section.group && (
              <p className="px-2 mb-1 text-[10px] font-semibold tracking-widest text-[#3a3a5a] uppercase">
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
                        "flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-colors",
                        active
                          ? "bg-[#00ffc8]/10 text-[#00ffc8] font-medium"
                          : "text-[#6a6a8a] hover:bg-white/[0.04] hover:text-[#c4c4d4]"
                      )}
                    >
                      <Icon
                        size={15}
                        className={active ? "text-[#00ffc8]" : "text-[#3a3a5a]"}
                      />
                      <span className="flex-1">{item.label}</span>
                      {"badge" in item && item.badge ? (
                        <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-red-500/20 text-red-400 text-[10px] font-semibold">
                          {item.badge}
                        </span>
                      ) : null}
                      {isExternal && (
                        <ExternalLink size={11} className="text-[#3a3a5a]" />
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
      <div className="px-3 py-3 border-t border-white/5">
        <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-md">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#00ffc8] to-[#00a8ff] flex items-center justify-center shrink-0">
            <span className="text-[#080810] text-[11px] font-semibold">A</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-[#c4c4d4] truncate leading-tight">
              aniket@statis.dev
            </p>
            <p className="text-[10px] text-[#4a4a6a] leading-tight">Design Partner</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-[#3a3a5a] hover:text-[#8a8a9a] transition-colors shrink-0"
            title="Sign out"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}
