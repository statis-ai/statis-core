"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowRight, CheckCircle2 } from "lucide-react";

const FEATURES = [
  "Shared entity state across all your agents",
  "Policy evaluation before every action",
  "Exactly-once execution with idempotency",
  "Tamper-evident receipts for every action",
];

export default function AuthPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  function handleGoogle() {
    setLoading(true);
    // Simulate SSO — store mock session and redirect to onboarding
    localStorage.setItem("statis_user_email", "aniket@statis.dev");
    localStorage.setItem("statis_api_key", "sk_demo_xxxxxxxx");
    setTimeout(() => router.push("/onboarding/industry"), 600);
  }

  function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    localStorage.setItem("statis_user_email", email);
    localStorage.setItem("statis_api_key", "sk_demo_xxxxxxxx");
    router.push("/onboarding/industry");
  }

  return (
    <div className="min-h-screen flex">
      {/* Left — brand panel */}
      <div className="w-[480px] shrink-0 bg-[#050510] flex flex-col justify-between p-12 dot-pattern">
        <div>
          <div className="flex items-center gap-3 mb-14">
            <Image
              src="/logomark-transparent.png"
              alt="Statis"
              width={32}
              height={32}
              style={{ filter: "drop-shadow(0 0 6px rgba(0,255,200,0.45))" }}
            />
            <span className="text-lg font-semibold tracking-tight font-serif text-gradient">Statis</span>
          </div>

          <h1 className="text-3xl font-semibold text-white leading-snug mb-3">
            Agent execution<br />
            <span className="text-[#8a8a9a]">infrastructure.</span>
          </h1>
          <p className="text-[#5a5a7a] text-sm uppercase tracking-widest font-medium mb-10">
            Governed · Receipted · Exactly-Once
          </p>

          <ul className="flex flex-col gap-4">
            {FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-3">
                <CheckCircle2 size={16} className="text-[#00ffc8] shrink-0 mt-0.5" />
                <span className="text-[#8a8a9a] text-sm">{f}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-[#3a3a5a] text-xs">
          &copy; {new Date().getFullYear()} Statis. Agent Execution Infrastructure.
        </p>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center p-12 bg-[#080810]">
        <div className="w-full max-w-sm">
          <h2 className="text-2xl font-semibold text-white mb-2 tracking-tight">
            Sign in to Statis
          </h2>
          <p className="text-[#8a8a9a] text-sm mb-8">
            Access your agent execution console.
          </p>

          {/* Google SSO */}
          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-lg border border-white/10 bg-white/[0.03] text-[#c4c4d4] text-sm font-medium hover:bg-white/[0.06] hover:border-white/20 transition-colors mb-6 disabled:opacity-60"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            {loading ? "Signing in…" : "Continue with Google"}
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-white/8" />
            <span className="text-xs text-[#5a5a7a]">or</span>
            <div className="flex-1 h-px bg-white/8" />
          </div>

          <form onSubmit={handleEmail} className="space-y-3">
            <input
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-[#0a0a16] border border-white/8 text-white text-sm placeholder:text-[#4a4a6a] focus:outline-none focus:ring-1 focus:ring-[#00ffc8]/40"
            />
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-[#00ffc8] text-[#080810] text-sm font-semibold hover:bg-[#00ffc8]/90 transition-colors"
            >
              Continue with email
              <ArrowRight size={15} />
            </button>
          </form>

          <p className="text-xs text-[#5a5a7a] text-center mt-6">
            By continuing you agree to Statis&apos;s{" "}
            <span className="text-[#00ffc8] cursor-pointer">Terms of Service</span>
            {" "}and{" "}
            <span className="text-[#00ffc8] cursor-pointer">Privacy Policy</span>.
          </p>
        </div>
      </div>
    </div>
  );
}
