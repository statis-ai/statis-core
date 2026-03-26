"use client";

import { useRouter } from "next/navigation";
import { useOnboarding } from "@/components/OnboardingContext";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Shield, Database, Plug } from "lucide-react";

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

  const rules = actions.map((a) => RULE_MAP[a]).filter(Boolean).slice(0, 3);
  const displayRules = rules.length > 0 ? rules : ["churn_retention_v1", "refund_eligibility_v1"];
  const adapters = systems.map((s) => ADAPTER_MAP[s]).filter(Boolean).slice(0, 4);
  const entities =
    industry === "fintech" ? ["acct-42", "cust-771", "acct-88"] :
    industry === "saas" ? ["acct-42", "acct-88", "tenant-9"] :
    ["entity-001", "entity-002", "entity-003"];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-10">
      <div className="w-full max-w-2xl">
        <div className="flex items-center gap-2.5 mb-10">
          <Image
            src="/logomark-transparent.png"
            alt="Statis"
            width={24}
            height={24}
            className="rounded-md"
            style={{ filter: "drop-shadow(0 0 6px rgba(0,255,200,0.45))" }}
          />
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
          <p className="text-[#6a6a8a] text-sm mb-8">
            Here&apos;s what was created for you. You can edit any of it from your console.
          </p>
        </motion.div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          {/* Policies */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#0d0d1a] rounded-xl border border-white/8 p-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <Shield size={15} className="text-[#00ffc8]" />
              <span className="text-xs font-semibold uppercase tracking-widest text-[#5a5a7a]">Policies</span>
            </div>
            <ul className="flex flex-col gap-2">
              {displayRules.map((r) => (
                <li key={r} className="font-mono text-xs text-[#00ffc8]/80 bg-[#00ffc8]/8 px-2.5 py-1.5 rounded-md border border-[#00ffc8]/15">
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
            className="bg-[#0d0d1a] rounded-xl border border-white/8 p-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <Database size={15} className="text-[#00ffc8]" />
              <span className="text-xs font-semibold uppercase tracking-widest text-[#5a5a7a]">Entities</span>
            </div>
            <ul className="flex flex-col gap-2">
              {entities.map((e) => (
                <li key={e} className="font-mono text-xs text-[#8a8a9a] bg-white/4 px-2.5 py-1.5 rounded-md border border-white/8">
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
            className="bg-[#0d0d1a] rounded-xl border border-white/8 p-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <Plug size={15} className="text-[#00ffc8]" />
              <span className="text-xs font-semibold uppercase tracking-widest text-[#5a5a7a]">Adapters</span>
            </div>
            <ul className="flex flex-col gap-2">
              {(adapters.length > 0 ? adapters : [{ name: "Stripe", status: "connected" as const }]).map((a) => (
                <li key={a.name} className="flex items-center justify-between">
                  <span className="text-xs text-[#c4c4d4]">{a.name}</span>
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

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          onClick={() => router.push("/home")}
          className="flex items-center gap-2 px-6 py-3 rounded-lg bg-[#00ffc8] text-[#080810] text-sm font-semibold hover:bg-[#00ffc8]/90 transition-colors"
        >
          Open my console
          <ArrowRight size={15} />
        </motion.button>
      </div>
    </div>
  );
}
