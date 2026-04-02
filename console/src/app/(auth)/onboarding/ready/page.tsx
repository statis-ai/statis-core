"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useOnboarding } from "@/components/OnboardingContext";
import { motion } from "framer-motion";
import { ArrowRight, Shield, Database, Plug } from "lucide-react";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const RULE_MAP: Record<string, string> = {
  issue_refund: "refund_eligibility_v1",
  apply_discount: "churn_retention_v1",
  flag_for_review: "vip_escalation_v1",
  provision_instance: "auto_provision_v1",
  update_account: "account_update_v1",
  create_ticket: "ticket_create_v1",
};

const ADAPTER_MAP: Record<string, { name: string; status: "connected" | "ready" }> = {
  stripe: { name: "Stripe", status: "connected" },
  salesforce: { name: "Salesforce", status: "ready" },
  zendesk: { name: "Zendesk", status: "ready" },
  hubspot: { name: "HubSpot", status: "ready" },
  aws: { name: "AWS", status: "ready" },
  custom: { name: "Custom API", status: "ready" },
};

export default function ReadyPage() {
  const router = useRouter();
  const { industry, actions, systems } = useOnboarding();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const rules = actions.map((a) => RULE_MAP[a]).filter(Boolean).slice(0, 3);
  const displayRules = rules.length > 0 ? rules : ["churn_retention_v1", "refund_eligibility_v1"];
  const adapters = systems.map((s) => ADAPTER_MAP[s]).filter(Boolean).slice(0, 4);
  const entities =
    industry === "fintech" ? ["acct-42", "cust-771", "acct-88"] :
    industry === "saas" ? ["acct-42", "acct-88", "tenant-9"] :
    ["entity-001", "entity-002", "entity-003"];

  async function handleOpenConsole() {
    setError(null);
    const raw = localStorage.getItem("statis_pending_signup");
    if (!raw) {
      localStorage.setItem("statis_onboarding_complete", "true");
      router.push("/home");
      return;
    }

    const pending = JSON.parse(raw);
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/admin/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: pending.email,
          password: pending.password,
          project_name: pending.projectName,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.detail ?? "Signup failed. Please try again.");
        return;
      }
      localStorage.setItem("statis_api_key", data.api_key);
      localStorage.setItem("statis_tenant_id", data.tenant_id);
      localStorage.setItem("statis_onboarding_complete", "true");
      localStorage.removeItem("statis_pending_signup");
      router.push("/home");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-10">
      <div className="w-full max-w-2xl">
        <div className="flex items-center gap-2 mb-10">
          <span className="font-semibold text-[15px] tracking-tight text-white">
            statis
            <span className="inline-block ml-[1px] animate-pulse" style={{ width: "7px", height: "13px", background: "#ffffff" }} />
          </span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Console ready
          </div>
          <h1 className="text-3xl font-semibold text-white mb-2 tracking-tight">
            Your Statis console is set up.
          </h1>
          <p className="text-[#888888] text-sm mb-8">
            Here&apos;s what was created for you. You can edit any of it from your console.
          </p>
        </motion.div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          {/* Policies */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#111111] rounded border border-[#1a1a1a] p-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <Shield size={15} className="text-[#d4d4d4]" />
              <span className="text-xs font-semibold uppercase tracking-widest text-[#444444]">Policies</span>
            </div>
            <ul className="flex flex-col gap-2">
              {displayRules.map((r) => (
                <li key={r} className="font-mono text-xs text-[#d4d4d4]/80 bg-white/[0.06] px-2.5 py-1.5 rounded border border-[#1a1a1a]">
                  {r}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Entities */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[#111111] rounded border border-[#1a1a1a] p-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <Database size={15} className="text-[#d4d4d4]" />
              <span className="text-xs font-semibold uppercase tracking-widest text-[#444444]">Entities</span>
            </div>
            <ul className="flex flex-col gap-2">
              {entities.map((e) => (
                <li key={e} className="font-mono text-xs text-[#888888] bg-white/[0.04] px-2.5 py-1.5 rounded border border-[#1a1a1a]">
                  {e}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Adapters */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-[#111111] rounded border border-[#1a1a1a] p-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <Plug size={15} className="text-[#d4d4d4]" />
              <span className="text-xs font-semibold uppercase tracking-widest text-[#444444]">Adapters</span>
            </div>
            <ul className="flex flex-col gap-2">
              {(adapters.length > 0 ? adapters : [{ name: "Stripe", status: "connected" as const }]).map((a) => (
                <li key={a.name} className="flex items-center justify-between">
                  <span className="text-xs text-[#888888]">{a.name}</span>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                    a.status === "connected"
                      ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20"
                      : "bg-sky-500/15 text-sky-400 border-sky-500/20"
                  }`}>
                    {a.status === "connected" ? "Connected" : "Ready"}
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <button
            onClick={handleOpenConsole}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 rounded bg-[#d4d4d4] text-[#0a0a0a] text-sm font-semibold hover:bg-white transition-colors disabled:opacity-50"
          >
            {loading ? "Setting up..." : "Open my console"}
            <ArrowRight size={15} />
          </button>
          {error && (
            <p className="text-[12px] text-red-400 mt-3">{error}</p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
