"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Shield, Zap, FileText, Lock, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const SLIDES = [
  {
    tag: "Policy Engine",
    headline: "Every action evaluated before it executes.",
    sub: "Deterministic policy rules act as a circuit breaker — approve, deny, or escalate in under 5 ms.",
    visual: (
      <div className="bg-[#0d0d0d] rounded border border-[#1a1a1a] p-4 font-mono text-[11px] space-y-1.5">
        <div className="text-[#444444]"># churn_retention_v1</div>
        <div className="text-[#888888]"><span className="text-sky-400">if</span> action.type == <span className="text-amber-400">&quot;apply_discount&quot;</span>:</div>
        <div className="text-[#888888] pl-4"><span className="text-sky-400">require</span> entity.ltv &gt;= <span className="text-emerald-400">500</span></div>
        <div className="text-[#888888] pl-4"><span className="text-sky-400">require</span> discount &lt;= <span className="text-emerald-400">0.30</span></div>
        <div className="text-[#888888] pl-4"><span className="text-sky-400">max_per_day</span>: <span className="text-emerald-400">3</span></div>
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#1a1a1a]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="text-emerald-400">APPROVED</span>
          <span className="text-[#333] ml-auto">3.2 ms</span>
        </div>
      </div>
    ),
  },
  {
    tag: "Receipts",
    headline: "Tamper-evident records for every outcome.",
    sub: "A SHA-256 hash is written atomically at execution time — immutable proof of what your agent did and why.",
    visual: (
      <div className="bg-[#0d0d0d] rounded border border-[#1a1a1a] p-4 font-mono text-[11px] space-y-2">
        <div className="flex justify-between">
          <span className="text-[#444444]">receipt_id</span>
          <span className="text-[#888888]">rcpt_9xKm2p</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#444444]">action</span>
          <span className="text-amber-400">issue_refund</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#444444]">entity</span>
          <span className="text-[#888888]">cust-771</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#444444]">amount</span>
          <span className="text-emerald-400">$49.00</span>
        </div>
        <div className="pt-2 border-t border-[#1a1a1a]">
          <div className="text-[#444444] mb-1">sha256</div>
          <div className="text-[#555555] break-all leading-relaxed">a3f9c2e1b847d...</div>
        </div>
      </div>
    ),
  },
  {
    tag: "Escalations",
    headline: "Humans stay in the loop for high-stakes actions.",
    sub: "Flag actions above a risk threshold for operator review. Approve or deny with a full audit trail.",
    visual: (
      <div className="bg-[#0d0d0d] rounded border border-[#1a1a1a] overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[#1a1a1a]">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          <span className="text-[11px] text-[#888888] font-mono">2 pending escalations</span>
        </div>
        <div className="divide-y divide-[#1a1a1a]">
          {[
            { id: "esc_4Lp", action: "provision_instance", entity: "tenant-9", risk: "HIGH" },
            { id: "esc_2Qr", action: "update_account", entity: "acct-88", risk: "MED" },
          ].map((e) => (
            <div key={e.id} className="px-4 py-3 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-mono text-[#d4d4d4] truncate">{e.action}</div>
                <div className="text-[10px] text-[#444444]">{e.entity}</div>
              </div>
              <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border ${
                e.risk === "HIGH"
                  ? "bg-red-500/15 text-red-400 border-red-500/20"
                  : "bg-amber-500/15 text-amber-400 border-amber-500/20"
              }`}>{e.risk}</span>
              <div className="flex gap-1.5">
                <button className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">Approve</button>
                <button className="text-[10px] px-2 py-0.5 rounded bg-[#1a1a1a] text-[#444444] border border-[#222]">Deny</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    tag: "Audit Trail",
    headline: "Real-time stream of every agent event.",
    sub: "Every trigger, evaluation, and execution is logged. Queryable by entity, action type, or policy.",
    visual: (
      <div className="bg-[#0d0d0d] rounded border border-[#1a1a1a] overflow-hidden font-mono text-[11px]">
        <div className="px-4 py-2.5 border-b border-[#1a1a1a] text-[#444444]">event stream</div>
        <div className="divide-y divide-[#111]">
          {[
            { ts: "14:32:01", type: "ACTION_EXECUTED", label: "issue_refund", color: "text-emerald-400" },
            { ts: "14:31:58", type: "POLICY_EVALUATED", label: "churn_retention_v1", color: "text-sky-400" },
            { ts: "14:31:55", type: "ACTION_DENIED", label: "apply_discount", color: "text-red-400" },
            { ts: "14:31:40", type: "ESCALATION_RAISED", label: "provision_instance", color: "text-amber-400" },
          ].map((ev, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-2.5">
              <span className="text-[#333] shrink-0">{ev.ts}</span>
              <span className={`shrink-0 ${ev.color}`}>{ev.type}</span>
              <span className="text-[#555] truncate">{ev.label}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
];

const SETUP_STEPS = [
  "Initialising workspace...",
  "Creating API key...",
  "Seeding policy engine...",
  "Starting event bus...",
  "Console ready.",
];

export default function AuthPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [projectName, setProjectName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [slideIndex, setSlideIndex] = useState(0);
  const [setupVisible, setSetupVisible] = useState(false);
  const [setupStepsDone, setSetupStepsDone] = useState<number[]>([]);
  const [setupComplete, setSetupComplete] = useState(false);

  useEffect(() => {
    const apiKey = localStorage.getItem("statis_api_key");
    if (apiKey) {
      router.replace("/home");
      return;
    }
    const params = new URLSearchParams(window.location.search);
    const modeParam = params.get("mode");
    if (modeParam === "signup" || modeParam === "signin") {
      setMode(modeParam);
    }
  }, [router]);

  // Auto-advance slides
  useEffect(() => {
    const t = setInterval(() => {
      setSlideIndex((i) => (i + 1) % SLIDES.length);
    }, 4000);
    return () => clearInterval(t);
  }, []);

  function runSetupAnimation(onDone: () => void) {
    setSetupVisible(true);
    SETUP_STEPS.forEach((_, i) => {
      setTimeout(() => {
        setSetupStepsDone((v) => [...v, i]);
        if (i === SETUP_STEPS.length - 1) {
          setTimeout(() => {
            setSetupComplete(true);
            setTimeout(onDone, 600);
          }, 400);
        }
      }, i * 550);
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email) return;

    setLoading(true);
    try {
      if (mode === "signin") {
        const res = await fetch(`${BASE}/admin/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.detail ?? "Sign in failed.");
          return;
        }
        localStorage.setItem("statis_api_key", data.api_key);
        localStorage.setItem("statis_tenant_id", data.tenant_id);
        router.push("/home");
      } else {
        const res = await fetch(`${BASE}/admin/signup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            password,
            project_name: projectName || "My Project",
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.detail ?? "Signup failed. Please try again.");
          return;
        }
        localStorage.setItem("statis_api_key", data.api_key);
        localStorage.setItem("statis_tenant_id", data.tenant_id);
        setLoading(false);
        runSetupAnimation(() => router.push("/home"));
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-[#0a0a0a] relative overflow-hidden">
      {/* Setup animation overlay */}
      <AnimatePresence>
        {setupVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0a0a]"
          >
            <div className="w-full max-w-lg px-6">
              <div className="flex items-center gap-2 mb-8">
                <span className="font-semibold text-[15px] tracking-tight text-white">
                  statis
                  <span className="inline-block ml-[1px] animate-pulse" style={{ width: "7px", height: "13px", background: "#ffffff" }} />
                </span>
                <span className="text-[#444444] text-sm font-mono ml-2">Setting up your console...</span>
              </div>

              <div className="bg-[#111111] rounded overflow-hidden border border-[#1a1a1a] shadow-2xl">
                <div className="flex items-center gap-1.5 px-4 py-3 border-b border-[#1a1a1a]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#333]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#262626]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#1f1f1f]" />
                  <span className="ml-2 text-[11px] text-[#444444] font-mono">statis bootstrap</span>
                </div>
                <div className="p-5 font-mono text-[13px] min-h-[200px] space-y-2">
                  <AnimatePresence>
                    {SETUP_STEPS.map((step, i) =>
                      setupStepsDone.includes(i) ? (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          className="flex items-center gap-3"
                        >
                          <span className="text-[#d4d4d4]">$</span>
                          <span className={i === SETUP_STEPS.length - 1 ? "text-[#d4d4d4] font-medium" : "text-[#888888]"}>
                            {step}
                          </span>
                          {i < SETUP_STEPS.length - 1 && (
                            <CheckCircle2 size={12} className="text-emerald-400 shrink-0 ml-auto" />
                          )}
                        </motion.div>
                      ) : null
                    )}
                  </AnimatePresence>
                  {!setupComplete && setupStepsDone.length < SETUP_STEPS.length && (
                    <motion.span
                      animate={{ opacity: [1, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity }}
                      className="inline-block w-1.5 h-4 bg-[#444444] rounded-sm ml-4"
                    />
                  )}
                </div>
              </div>

              {setupComplete && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center text-sm text-[#444444] mt-6"
                >
                  Redirecting to your console...
                </motion.p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Left — sliding feature panel */}
      <div className="hidden lg:flex w-[520px] shrink-0 flex-col justify-between p-14 border-r border-[#1a1a1a] relative z-10 overflow-hidden">
        <div>
          {/* Logo */}
          <div className="flex items-center gap-2 mb-14">
            <span className="text-lg font-semibold tracking-tight text-white">
              statis
              <span className="inline-block ml-[1px] animate-pulse" style={{ width: "8px", height: "16px", background: "#ffffff" }} />
            </span>
          </div>

          {/* Slide content */}
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={slideIndex}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
              >
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.04] border border-[#1a1a1a] text-[10px] font-semibold tracking-[0.15em] text-[#444444] uppercase mb-5">
                  {SLIDES[slideIndex].tag}
                </div>
                <h2 className="text-[24px] font-semibold text-white leading-[1.25] tracking-tight mb-3">
                  {SLIDES[slideIndex].headline}
                </h2>
                <p className="text-[13px] text-[#555555] leading-relaxed mb-8 max-w-[360px]">
                  {SLIDES[slideIndex].sub}
                </p>
                <div className="max-w-[380px]">
                  {SLIDES[slideIndex].visual}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Slide indicators + footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setSlideIndex(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === slideIndex
                    ? "w-5 h-1.5 bg-[#888888]"
                    : "w-1.5 h-1.5 bg-[#2a2a2a] hover:bg-[#3a3a3a]"
                }`}
              />
            ))}
          </div>
          <p className="text-[11px] text-[#333]">
            &copy; {new Date().getFullYear()} Statis, Inc.
          </p>
        </div>
      </div>

      {/* Right — form panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative z-10">
        {/* Mobile logo */}
        <div className="flex lg:hidden items-center gap-2 mb-10">
          <span className="text-[16px] font-semibold tracking-tight text-white">
            statis
            <span className="inline-block ml-[1px] animate-pulse" style={{ width: "7px", height: "13px", background: "#ffffff" }} />
          </span>
        </div>

        <div className="w-full max-w-[380px]">
          <div className="mb-8">
            <h2 className="text-[22px] font-semibold text-white tracking-tight mb-1.5">
              {mode === "signin" ? "Welcome back" : "Get started with Statis"}
            </h2>
            <p className="text-[13px] text-[#444444]">
              {mode === "signin"
                ? "Sign in to your agent execution console."
                : "Create your workspace and start governing agent actions."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-[11px] font-medium text-[#444444] uppercase tracking-wider mb-1.5">
                Work email
              </label>
              <input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded bg-white/[0.03] border border-[#1a1a1a] text-white text-[13px] placeholder:text-[#333] focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/10 transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[#444444] uppercase tracking-wider mb-1.5">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded bg-white/[0.03] border border-[#1a1a1a] text-white text-[13px] placeholder:text-[#333] focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/10 transition-colors"
              />
            </div>

            {mode === "signup" && (
              <div>
                <label className="block text-[11px] font-medium text-[#444444] uppercase tracking-wider mb-1.5">
                  Project name
                </label>
                <input
                  type="text"
                  placeholder="e.g., Keel, Core API"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded bg-white/[0.03] border border-[#1a1a1a] text-white text-[13px] placeholder:text-[#333] focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/10 transition-colors"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded bg-[#d4d4d4] text-[#0a0a0a] text-[13px] font-semibold hover:bg-white active:scale-[0.99] transition-all duration-150 mt-1 disabled:opacity-50"
            >
              {loading
                ? mode === "signin" ? "Signing in..." : "Creating workspace..."
                : mode === "signin" ? "Sign in" : "Create workspace"}
              <ArrowRight size={14} />
            </button>

            {error && (
              <p className="text-[12px] text-red-400 text-center mt-1">{error}</p>
            )}
          </form>

          <p className="text-[12px] text-[#444444] text-center mt-6">
            {mode === "signin" ? (
              <>
                No account?{" "}
                <button onClick={() => setMode("signup")} className="text-[#d4d4d4]/70 hover:text-[#d4d4d4] transition-colors">
                  Create workspace
                </button>
              </>
            ) : (
              <>
                Already have a workspace?{" "}
                <button onClick={() => setMode("signin")} className="text-[#d4d4d4]/70 hover:text-[#d4d4d4] transition-colors">
                  Sign in
                </button>
              </>
            )}
          </p>

          <p className="text-[11px] text-[#333] text-center mt-3">
            By continuing you agree to Statis&apos;s{" "}
            <span className="text-[#444444] cursor-pointer hover:text-[#888888] transition-colors">Terms of Service</span>
            {" "}and{" "}
            <span className="text-[#444444] cursor-pointer hover:text-[#888888] transition-colors">Privacy Policy</span>.
          </p>
        </div>
      </div>
    </div>
  );
}
