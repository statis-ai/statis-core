"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowRight, Shield, Zap, FileText, Lock } from "lucide-react";

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
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [projectName, setProjectName] = useState("");

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

  function handleGoogle() {
    setLoading(true);
    localStorage.setItem("statis_user_email", "aniket@statis.dev");
    localStorage.setItem("statis_api_key", "sk_demo_xxxxxxxx");
    setTimeout(() => router.push("/onboarding/industry"), 800);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    localStorage.setItem("statis_user_email", email);
    localStorage.setItem("statis_api_key", "sk_demo_xxxxxxxx");
    router.push("/onboarding/industry");
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

          {/* Google SSO */}
          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-lg border border-white/[0.1] bg-white/[0.03] text-[#c4c4d4] text-[13px] font-medium hover:bg-white/[0.05] hover:border-white/[0.16] transition-all duration-150 mb-5 disabled:opacity-50"
          >
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            {loading ? "Signing in…" : "Continue with Google"}
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-white/[0.06]" />
            <span className="text-[11px] text-[#3a3a5a] uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-white/[0.06]" />
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
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-[#00ffc8] text-[#080810] text-[13px] font-semibold hover:bg-[#00ffc8]/90 active:scale-[0.99] transition-all duration-150 mt-1"
            >
              {mode === "signin" ? "Sign in" : "Create workspace"}
              <ArrowRight size={14} />
            </button>
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
