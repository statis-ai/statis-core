"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowRight, Shield, Zap, FileText, Lock } from "lucide-react";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const FEATURES = [
  {
    icon: Shield,
    title: "Policy-first governance",
    desc: "Deterministic rules evaluated before every action executes.",
  },
  {
    icon: Zap,
    title: "Exactly-once execution",
    desc: "Distributed lock prevents duplicate actions across retries.",
  },
  {
    icon: FileText,
    title: "Tamper-evident receipts",
    desc: "SHA-256 hash written atomically at execution time.",
  },
  {
    icon: Lock,
    title: "Human-in-the-loop",
    desc: "Escalation flow for actions requiring operator approval.",
  },
];

export default function AuthPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [projectName, setProjectName] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const apiKey = localStorage.getItem("statis_api_key");
    if (apiKey) {
      const onboarded = localStorage.getItem("statis_onboarding_complete");
      if (onboarded) {
        router.replace("/home");
      } else {
        router.replace("/onboarding/industry");
      }
    }
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email) return;

    if (mode === "signin") {
      setLoading(true);
      try {
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
      } catch {
        setError("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    } else {
      localStorage.setItem(
        "statis_pending_signup",
        JSON.stringify({ email, password, projectName })
      );
      router.push("/onboarding/industry");
    }
  }

  return (
    <div className="min-h-screen flex bg-[#080810] relative overflow-hidden">
      {/* Background — identical to landing GlobalBackground */}
      <div aria-hidden className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        {/* Grid */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        {/* Orb 1 — cyan, top-left */}
        <div
          className="absolute rounded-full"
          style={{
            top: "-10%", left: "-5%",
            width: "55vw", height: "55vw",
            background: "radial-gradient(ellipse at center, rgba(0,255,200,0.055) 0%, transparent 68%)",
            animation: "orb1Drift 20s ease-in-out infinite alternate",
          }}
        />
        {/* Orb 2 — violet, center-right */}
        <div
          className="absolute rounded-full"
          style={{
            top: "30%", right: "-15%",
            width: "60vw", height: "60vw",
            background: "radial-gradient(ellipse at center, rgba(99,102,241,0.045) 0%, transparent 68%)",
            animation: "orb2Drift 26s ease-in-out infinite alternate-reverse",
          }}
        />
        {/* Orb 3 — blue, bottom-left */}
        <div
          className="absolute rounded-full"
          style={{
            bottom: "-10%", left: "10%",
            width: "50vw", height: "50vw",
            background: "radial-gradient(ellipse at center, rgba(56,189,248,0.035) 0%, transparent 68%)",
            animation: "orb3Drift 32s ease-in-out infinite alternate",
          }}
        />
      </div>

      {/* Left — brand panel */}
      <div className="hidden lg:flex w-[500px] shrink-0 flex-col justify-between p-14 border-r border-white/[0.06] relative z-10">
        <div>
          {/* Logo — matches landing navbar exactly */}
          <div className="flex items-center gap-2.5 mb-16">
            <Image
              src="/logomark-transparent.png"
              alt="Statis"
              width={28}
              height={28}
              className="shrink-0 rounded-md"
              style={{ filter: "drop-shadow(0 0 6px rgba(0,255,200,0.45))" }}
              priority
            />
            <span className="text-lg font-semibold tracking-tight text-gradient">
              Statis
            </span>
          </div>

          {/* Headline */}
          <div className="mb-12">
            <p className="text-[11px] font-semibold tracking-[0.2em] text-[#00ffc8]/60 uppercase mb-4">
              Agent Execution Infrastructure
            </p>
            <h1 className="text-[30px] font-semibold text-white leading-[1.2] tracking-tight mb-4">
              Governed actions.<br />
              <span className="text-[#4a4a6a]">Receipted outcomes.</span>
            </h1>
            <p className="text-[#5a5a7a] text-[14px] leading-relaxed max-w-[340px]">
              The execution layer between your AI agents and production systems.
              Every action proposed, evaluated, and receipted.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-5">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center shrink-0 mt-0.5">
                  <Icon size={14} className="text-[#00ffc8]" />
                </div>
                <div>
                  <p className="text-[13px] font-medium text-[#c4c4d4] leading-tight mb-0.5">{title}</p>
                  <p className="text-[12px] text-[#4a4a6a] leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-[11px] text-[#2a2a4a]">
          &copy; {new Date().getFullYear()} Statis, Inc. All rights reserved.
        </p>
      </div>

      {/* Right — form panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative z-10">
        {/* Mobile logo */}
        <div className="flex lg:hidden items-center gap-2.5 mb-10">
          <Image
            src="/logomark-transparent.png"
            alt="Statis"
            width={26}
            height={26}
            className="shrink-0 rounded-md"
            style={{ filter: "drop-shadow(0 0 6px rgba(0,255,200,0.45))" }}
          />
          <span className="text-[16px] font-semibold tracking-tight text-gradient">Statis</span>
        </div>

        <div className="w-full max-w-[380px]">
          <div className="mb-8">
            <h2 className="text-[22px] font-semibold text-white tracking-tight mb-1.5">
              {mode === "signin" ? "Welcome back" : "Create your workspace"}
            </h2>
            <p className="text-[13px] text-[#4a4a6a]">
              {mode === "signin"
                ? "Sign in to your agent execution console."
                : "Get your Master API Key and start governing agent actions."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-[11px] font-medium text-[#4a4a6a] uppercase tracking-wider mb-1.5">
                Work email
              </label>
              <input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.08] text-white text-[13px] placeholder:text-[#2a2a4a] focus:outline-none focus:border-[#00ffc8]/40 focus:ring-1 focus:ring-[#00ffc8]/20 transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[#4a4a6a] uppercase tracking-wider mb-1.5">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.08] text-white text-[13px] placeholder:text-[#2a2a4a] focus:outline-none focus:border-[#00ffc8]/40 focus:ring-1 focus:ring-[#00ffc8]/20 transition-colors"
              />
            </div>

            {mode === "signup" && (
              <div>
                <label className="block text-[11px] font-medium text-[#4a4a6a] uppercase tracking-wider mb-1.5">
                  Project name
                </label>
                <input
                  type="text"
                  placeholder="e.g., Keel, Core API"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.08] text-white text-[13px] placeholder:text-[#2a2a4a] focus:outline-none focus:border-[#00ffc8]/40 focus:ring-1 focus:ring-[#00ffc8]/20 transition-colors"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-[#00ffc8] text-[#080810] text-[13px] font-semibold hover:bg-[#00ffc8]/90 active:scale-[0.99] transition-all duration-150 mt-1 disabled:opacity-50"
            >
              {loading ? "Signing in…" : mode === "signin" ? "Sign in" : "Create workspace"}
              <ArrowRight size={14} />
            </button>

            {error && (
              <p className="text-[12px] text-red-400 text-center mt-1">{error}</p>
            )}
          </form>

          <p className="text-[12px] text-[#3a3a5a] text-center mt-6">
            {mode === "signin" ? (
              <>
                No account?{" "}
                <button onClick={() => setMode("signup")} className="text-[#00ffc8]/70 hover:text-[#00ffc8] transition-colors">
                  Create workspace
                </button>
              </>
            ) : (
              <>
                Already have a workspace?{" "}
                <button onClick={() => setMode("signin")} className="text-[#00ffc8]/70 hover:text-[#00ffc8] transition-colors">
                  Sign in
                </button>
              </>
            )}
          </p>

          <p className="text-[11px] text-[#2a2a3a] text-center mt-3">
            By continuing you agree to Statis&apos;s{" "}
            <span className="text-[#3a3a5a] cursor-pointer hover:text-[#5a5a7a] transition-colors">Terms of Service</span>
            {" "}and{" "}
            <span className="text-[#3a3a5a] cursor-pointer hover:text-[#5a5a7a] transition-colors">Privacy Policy</span>.
          </p>
        </div>
      </div>
    </div>
  );
}
