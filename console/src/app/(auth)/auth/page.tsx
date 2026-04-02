"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
        router.replace("/onboarding/actions");
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
      router.push("/onboarding/actions");
    }
  }

  return (
    <div className="min-h-screen flex bg-[#0a0a0a] relative overflow-hidden">
      {/* Left — brand panel */}
      <div className="hidden lg:flex w-[500px] shrink-0 flex-col justify-between p-14 border-r border-[#1a1a1a] relative z-10">
        <div>
          {/* Logo */}
          <div className="flex items-center gap-2 mb-16">
            <span className="text-lg font-semibold tracking-tight text-white">
              statis
              <span className="inline-block ml-[1px] animate-pulse" style={{ width: "8px", height: "16px", background: "#ffffff" }} />
            </span>
          </div>

          {/* Headline */}
          <div className="mb-12">
            <p className="text-[11px] font-semibold tracking-[0.2em] text-[#444444] uppercase mb-4">
              Agent Execution Infrastructure
            </p>
            <h1 className="text-[30px] font-semibold text-white leading-[1.2] tracking-tight mb-4">
              Governed actions.<br />
              <span className="text-[#444444]">Receipted outcomes.</span>
            </h1>
            <p className="text-[#888888] text-[14px] leading-relaxed max-w-[340px]">
              The execution layer between your AI agents and production systems.
              Every action proposed, evaluated, and receipted.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-5">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-4">
                <div className="w-8 h-8 rounded bg-white/[0.04] border border-[#1a1a1a] flex items-center justify-center shrink-0 mt-0.5">
                  <Icon size={14} className="text-[#d4d4d4]" />
                </div>
                <div>
                  <p className="text-[13px] font-medium text-[#888888] leading-tight mb-0.5">{title}</p>
                  <p className="text-[12px] text-[#444444] leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-[11px] text-[#333]">
          &copy; {new Date().getFullYear()} Statis, Inc. All rights reserved.
        </p>
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
              {mode === "signin" ? "Welcome back" : "Create your workspace"}
            </h2>
            <p className="text-[13px] text-[#444444]">
              {mode === "signin"
                ? "Sign in to your agent execution console."
                : "Get your Master API Key and start governing agent actions."}
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
              {loading ? "Signing in..." : mode === "signin" ? "Sign in" : "Create workspace"}
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
