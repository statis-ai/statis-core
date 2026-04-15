"use client";

import { useRef, useState } from "react";
import { motion, useMotionValue, useTransform, useSpring, useInView } from "framer-motion";
import { Section, Eyebrow, SectionReveal } from "./shared";

const METRICS = [
  { label: "Actions Today", value: 12847, suffix: "", format: true, sub: "+1,203 vs yesterday" },
  { label: "Execution Rate", value: 99.97, suffix: "%", format: false, sub: "of committed" },
  { label: "Escalations", value: 3, suffix: "", format: false, sub: "awaiting review" },
  { label: "Receipts Minted", value: 1.28, suffix: "M", format: false, sub: "all time" },
];

type ActionStatus = "COMPLETED" | "ESCALATED" | "DENIED";

const ACTIONS: {
  id: string;
  service: string;
  serviceColor: string;
  action: string;
  status: ActionStatus;
  policy: string;
  time: string;
}[] = [
  { id: "act-f93a", service: "svc-landing", serviceColor: "#A78BFA", action: "deploy_landing_page", status: "COMPLETED", policy: "infra_deploy_v1", time: "4s ago" },
  { id: "act-e41b", service: "svc-api", serviceColor: "#34D399", action: "run_test_suite", status: "COMPLETED", policy: "ci_gate_v1", time: "12s ago" },
  { id: "act-d28c", service: "svc-infra", serviceColor: "#FACC15", action: "update_dns_record", status: "ESCALATED", policy: "infra_change_v2", time: "1m ago" },
  { id: "act-c77d", service: "svc-comms", serviceColor: "#60A5FA", action: "send_slack_alert", status: "COMPLETED", policy: "comms_policy_v1", time: "3m ago" },
  { id: "act-b19e", service: "svc-api", serviceColor: "#34D399", action: "scale_api_workers", status: "COMPLETED", policy: "infra_deploy_v1", time: "7m ago" },
];

const STATUS_STYLES: Record<ActionStatus, { color: string; bg: string; border: string }> = {
  COMPLETED: { color: "#34D399", bg: "rgba(52,211,153,0.1)", border: "rgba(52,211,153,0.22)" },
  ESCALATED: { color: "#FACC15", bg: "rgba(250,204,21,0.1)", border: "rgba(250,204,21,0.22)" },
  DENIED: { color: "#F87171", bg: "rgba(248,113,113,0.1)", border: "rgba(248,113,113,0.22)" },
};

const TABS = [
  { label: "All", count: "12,847" },
  { label: "Completed", count: "12,802" },
  { label: "Escalated", count: "3" },
  { label: "Denied", count: "42" },
];

function AnimatedCounter({ value, suffix, format }: { value: number; suffix: string; format: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const spring = useSpring(0, { stiffness: 50, damping: 20 });

  if (inView) spring.set(value);

  return (
    <span ref={ref} className="text-[28px] font-bold text-white tracking-tight">
      {inView ? (format ? value.toLocaleString() : `${value}${suffix}`) : "0"}
    </span>
  );
}

function Sidebar() {
  const items: { icon: string; label: string; active?: boolean; badge?: string; section?: string }[] = [
    { icon: "⌂", label: "Home", active: true },
    { icon: "✉", label: "Inbox", badge: "4" },
    { section: "Observe", icon: "", label: "" },
    { icon: "⚡", label: "Actions" },
    { icon: "📄", label: "Receipts" },
    { icon: "◆", label: "Entities" },
    { section: "Govern", icon: "", label: "" },
    { icon: "🛡", label: "Policies" },
    { icon: "↑", label: "Escalations", badge: "2" },
    { section: "Connect", icon: "", label: "" },
    { icon: "⊕", label: "Adapters" },
    { icon: "⟲", label: "Webhooks" },
  ];

  return (
    <div
      className="hidden lg:flex flex-col w-[200px] py-4 px-3 shrink-0"
      style={{ borderRight: "1px solid var(--border)", background: "rgba(0,0,0,0.25)" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 px-1 mb-5">
        <div
          className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold"
          style={{ background: "linear-gradient(135deg, #00D4FF, #5E6AD2)", color: "#000" }}
        >
          S
        </div>
        <span className="text-[13px] font-semibold text-white tracking-tight">statis</span>
      </div>

      {items.map((item, i) => {
        if (item.section) {
          return (
            <div
              key={`s-${i}`}
              className="text-[9px] font-mono uppercase tracking-[0.18em] px-2 pt-4 pb-1.5"
              style={{ color: "var(--text-muted)" }}
            >
              {item.section}
            </div>
          );
        }
        return (
          <div
            key={item.label}
            className="flex items-center gap-2 px-2 py-1.5 rounded-md text-[12px] mb-0.5 transition-colors cursor-pointer"
            style={{
              background: item.active ? "rgba(255,255,255,0.06)" : "transparent",
              color: item.active ? "var(--text)" : "var(--text-2)",
              border: item.active ? "1px solid rgba(255,255,255,0.08)" : "1px solid transparent",
            }}
          >
            <span className="text-[11px] w-3.5 opacity-70">{item.icon}</span>
            <span className="flex-1">{item.label}</span>
            {item.badge && (
              <span
                className="text-[9px] font-mono px-1.5 rounded"
                style={{
                  background: "rgba(250,204,21,0.1)",
                  color: "#FACC15",
                  border: "1px solid rgba(250,204,21,0.2)",
                }}
              >
                {item.badge}
              </span>
            )}
          </div>
        );
      })}

      {/* User footer */}
      <div className="mt-auto pt-3 flex items-center gap-2 px-1" style={{ borderTop: "1px solid var(--border)" }}>
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold mt-3"
          style={{ background: "linear-gradient(135deg, #00D4FF, #5E6AD2)", color: "#000" }}
        >
          A
        </div>
        <div className="mt-3">
          <div className="text-[11px] font-medium text-white leading-tight">Aniket Kumar</div>
          <div className="text-[10px]" style={{ color: "var(--text-muted)" }}>statis.dev</div>
        </div>
      </div>
    </div>
  );
}

export function Console() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState(0);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-300, 300], [2, -2]);
  const rotateY = useTransform(mouseX, [-400, 400], [-2, 2]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  };

  return (
    <Section>
      <SectionReveal>
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-6"
            style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#00D4FF", boxShadow: "0 0 8px #00D4FF" }} />
            <span className="text-[11px] font-mono uppercase tracking-[0.2em]" style={{ color: "var(--text-2)" }}>Console</span>
          </div>
          <h2
            className="font-bold tracking-[-0.03em] max-w-3xl mx-auto"
            style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)" }}
          >
            See everything. Control everything.
          </h2>
          <p className="text-[15px] mt-4 max-w-xl mx-auto" style={{ color: "var(--text-2)" }}>
            Every agent action observable, every policy decision auditable, every connector under one roof.
          </p>
        </div>
      </SectionReveal>

      <SectionReveal>
        <div className="relative">
          {/* Multi-layer animated gradient backdrop */}
          <div
            aria-hidden
            className="absolute pointer-events-none"
            style={{ inset: "-260px -30vw" }}
          >
            <div className="relative w-full h-full" style={{ mixBlendMode: "screen" }}>
              {/* Drifting indigo blob (left) */}
              <div
                className="absolute rounded-full"
                style={{
                  width: "70%",
                  height: "85%",
                  left: "-5%",
                  top: "5%",
                  background: "radial-gradient(circle, rgba(94,106,210,0.85), transparent 60%)",
                  filter: "blur(60px)",
                  animation: "console-drift-1 18s ease-in-out infinite",
                }}
              />
              {/* Drifting magenta blob (right) */}
              <div
                className="absolute rounded-full"
                style={{
                  width: "70%",
                  height: "85%",
                  right: "-5%",
                  top: "10%",
                  background: "radial-gradient(circle, rgba(210,70,230,0.7), transparent 60%)",
                  filter: "blur(70px)",
                  animation: "console-drift-2 22s ease-in-out infinite",
                }}
              />
              {/* Drifting cyan blob (bottom) — dominant */}
              <div
                className="absolute rounded-full"
                style={{
                  width: "90%",
                  height: "80%",
                  left: "5%",
                  bottom: "-25%",
                  background: "radial-gradient(circle, rgba(0,212,255,1), transparent 55%)",
                  filter: "blur(70px)",
                  animation: "console-drift-3 24s ease-in-out infinite",
                }}
              />
              {/* Top blue accent */}
              <div
                className="absolute rounded-full"
                style={{
                  width: "55%",
                  height: "50%",
                  left: "22%",
                  top: "-15%",
                  background: "radial-gradient(circle, rgba(80,150,255,0.7), transparent 60%)",
                  filter: "blur(60px)",
                  animation: "console-drift-4 20s ease-in-out infinite",
                }}
              />
              {/* Warm magenta pulse (right-bottom) */}
              <div
                className="absolute rounded-full"
                style={{
                  width: "50%",
                  height: "60%",
                  right: "-5%",
                  bottom: "-10%",
                  background: "radial-gradient(circle, rgba(230,100,180,0.6), transparent 60%)",
                  filter: "blur(80px)",
                  animation: "console-drift-2 26s ease-in-out infinite reverse",
                }}
              />
            </div>
          </div>

          {/* Horizon glow above the card */}
          <div
            aria-hidden
            className="absolute left-0 right-0 -top-2 h-[1px] pointer-events-none"
            style={{
              background:
                "linear-gradient(to right, transparent 10%, rgba(0,212,255,0.6) 50%, transparent 90%)",
              boxShadow: "0 0 30px rgba(0,212,255,0.4), 0 0 60px rgba(0,212,255,0.2)",
            }}
          />

          <motion.div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => { mouseX.set(0); mouseY.set(0); }}
            style={{ perspective: 1600, rotateX, rotateY, transformStyle: "preserve-3d" }}
            className="relative"
          >
            <div
              className="rounded-2xl overflow-hidden shadow-2xl"
              style={{
                background: "linear-gradient(180deg, rgba(15,15,17,0.95), rgba(8,8,10,0.95))",
                border: "1px solid rgba(255,255,255,0.1)",
                boxShadow: "0 20px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03) inset",
              }}
            >
              {/* Window chrome */}
              <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#333" }} />
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#333" }} />
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#333" }} />
                </div>
                <div className="flex-1 flex items-center justify-center">
                  <span
                    className="text-[11px] font-mono px-3 py-1 rounded-md"
                    style={{ color: "var(--text-2)", background: "rgba(0,0,0,0.5)", border: "1px solid var(--border)" }}
                  >
                    console.statis.dev
                  </span>
                </div>
                <div className="w-[60px]" />
              </div>

              {/* Body: sidebar + main */}
              <div className="flex" style={{ minHeight: 560 }}>
                <Sidebar />

                {/* Main panel */}
                <div className="flex-1 flex flex-col min-w-0">
                  {/* Top bar: page title + search + live */}
                  <div className="px-6 py-4 flex items-center gap-3" style={{ borderBottom: "1px solid var(--border)" }}>
                    <h3 className="text-[14px] font-semibold text-white">Home</h3>
                    <span
                      className="text-[10px] font-mono px-2 py-0.5 rounded"
                      style={{ background: "rgba(255,255,255,0.06)", color: "var(--text-muted)" }}
                    >
                      Last 24h
                    </span>
                    <div className="ml-auto flex items-center gap-2">
                      <div
                        className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-md text-[11px]"
                        style={{ background: "rgba(0,0,0,0.3)", border: "1px solid var(--border)", color: "var(--text-muted)" }}
                      >
                        <span>🔍</span>
                        <span>Search actions…</span>
                        <span
                          className="ml-3 px-1 py-px rounded text-[9px] font-mono"
                          style={{ background: "rgba(255,255,255,0.05)" }}
                        >
                          ⌘K
                        </span>
                      </div>
                      <div
                        className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-mono"
                        style={{ background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.25)", color: "#34D399" }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#34D399", boxShadow: "0 0 6px #34D399" }} />
                        Live
                      </div>
                    </div>
                  </div>

                  {/* Metrics row */}
                  <div
                    className="grid grid-cols-2 md:grid-cols-4 gap-px"
                    style={{ background: "var(--border)", borderBottom: "1px solid var(--border)" }}
                  >
                    {METRICS.map((m) => (
                      <div key={m.label} className="px-5 py-4" style={{ background: "rgba(8,8,10,0.6)" }}>
                        <p className="text-[10px] uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>{m.label}</p>
                        <AnimatedCounter value={m.value} suffix={m.suffix} format={m.format} />
                        <p className="text-[10px] mt-1" style={{ color: "var(--text-muted)" }}>{m.sub}</p>
                      </div>
                    ))}
                  </div>

                  {/* Tabs */}
                  <div className="px-6 pt-4 flex items-center gap-1">
                    {TABS.map((tab, i) => {
                      const active = activeTab === i;
                      return (
                        <button
                          key={tab.label}
                          onClick={() => setActiveTab(i)}
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-[12px] transition-colors"
                          style={{
                            background: active ? "rgba(255,255,255,0.06)" : "transparent",
                            color: active ? "var(--text)" : "var(--text-2)",
                            border: active ? "1px solid rgba(255,255,255,0.1)" : "1px solid transparent",
                          }}
                        >
                          <span>{tab.label}</span>
                          <span className="text-[10px] font-mono" style={{ color: "var(--text-muted)" }}>{tab.count}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Recent Actions panel */}
                  <div className="px-6 pt-4 pb-6 flex-1">
                    <div
                      className="rounded-lg overflow-hidden"
                      style={{ background: "rgba(0,0,0,0.3)", border: "1px solid var(--border)" }}
                    >
                      {/* Panel header */}
                      <div
                        className="flex items-center justify-between px-4 py-2.5"
                        style={{ borderBottom: "1px solid var(--border)" }}
                      >
                        <span className="text-[10px] font-mono uppercase tracking-[0.18em]" style={{ color: "var(--text-muted)" }}>
                          Recent Actions
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-mono" style={{ color: "var(--text-muted)" }}>
                          <span className="w-1 h-1 rounded-full" style={{ background: "#00D4FF", boxShadow: "0 0 4px #00D4FF" }} />
                          auto-refresh
                        </span>
                      </div>

                      {/* Table header */}
                      <div
                        className="hidden md:grid grid-cols-[88px_140px_1fr_120px_140px_70px] gap-4 px-4 py-2 text-[10px] uppercase tracking-wider"
                        style={{ color: "var(--text-muted)", borderBottom: "1px solid var(--border)" }}
                      >
                        <span>ID</span>
                        <span>Service</span>
                        <span>Action</span>
                        <span>Status</span>
                        <span>Policy</span>
                        <span>Time</span>
                      </div>

                      {/* Rows */}
                      {ACTIONS.map((a, i) => {
                        const s = STATUS_STYLES[a.status];
                        return (
                          <div
                            key={a.id}
                            className="grid grid-cols-2 md:grid-cols-[88px_140px_1fr_120px_140px_70px] gap-4 px-4 py-2.5 text-[12px] items-center transition-colors"
                            style={{
                              borderBottom: i < ACTIONS.length - 1 ? "1px solid var(--border)" : "none",
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.02)"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                          >
                            <span className="font-mono text-[11px]" style={{ color: "var(--text-muted)" }}>{a.id}</span>
                            <span className="inline-flex items-center gap-2 font-mono text-[11px]" style={{ color: "var(--text-2)" }}>
                              <span
                                className="w-1.5 h-1.5 rounded-full"
                                style={{ background: a.serviceColor, boxShadow: `0 0 6px ${a.serviceColor}` }}
                              />
                              {a.service}
                            </span>
                            <span className="hidden md:block font-mono text-[11px]" style={{ color: "var(--text)" }}>{a.action}</span>
                            <span
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono w-fit"
                              style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}
                            >
                              <span className="w-1 h-1 rounded-full" style={{ background: s.color }} />
                              {a.status}
                            </span>
                            <span className="hidden md:block font-mono text-[11px]" style={{ color: "var(--text-2)" }}>{a.policy}</span>
                            <span className="hidden md:block text-[11px]" style={{ color: "var(--text-muted)" }}>{a.time}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </SectionReveal>

      <style>{`
        @keyframes console-drift-1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(6%, -4%) scale(1.12); }
          66% { transform: translate(-3%, 5%) scale(0.94); }
        }
        @keyframes console-drift-2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-5%, 3%) scale(1.08); }
          66% { transform: translate(4%, -5%) scale(0.93); }
        }
        @keyframes console-drift-3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-4%, -6%) scale(1.15); }
        }
        @keyframes console-drift-4 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(5%, 4%) scale(1.1); }
        }
      `}</style>
    </Section>
  );
}
