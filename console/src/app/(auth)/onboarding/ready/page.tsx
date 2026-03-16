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

  const rules = actions
    .map((a) => RULE_MAP[a])
    .filter(Boolean)
    .slice(0, 3);

  // Fallback rules
  const displayRules = rules.length > 0 ? rules : ["churn_retention_v1", "refund_eligibility_v1"];

  const adapters = systems.map((s) => ADAPTER_MAP[s]).filter(Boolean).slice(0, 4);

  const entities =
    industry === "fintech" ? ["acct-42", "cust-771", "acct-88"] :
    industry === "saas" ? ["acct-42", "acct-88", "tenant-9"] :
    ["entity-001", "entity-002", "entity-003"];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-10">
      <div className="w-full max-w-2xl">
        <div className="flex items-center gap-2.5 mb-10">
          <Image src="/statis-mark.svg" alt="Statis" width={24} height={24} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 border border-green-200 text-green-700 text-xs font-medium mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            Console ready
          </div>
          <h1 className="text-3xl font-semibold text-gray-900 mb-2 tracking-tight">
            Your Statis console is set up.
          </h1>
          <p className="text-gray-500 text-sm mb-8">
            Here&apos;s what was created for you. You can edit any of it from your console.
          </p>
        </motion.div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          {/* Policies */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl border border-gray-200 p-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <Shield size={15} className="text-indigo-500" />
              <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">Policies</span>
            </div>
            <ul className="flex flex-col gap-2">
              {displayRules.map((r) => (
                <li key={r} className="font-mono text-xs text-indigo-700 bg-indigo-50 px-2.5 py-1.5 rounded-md">
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
            className="bg-white rounded-xl border border-gray-200 p-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <Database size={15} className="text-indigo-500" />
              <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">Entities</span>
            </div>
            <ul className="flex flex-col gap-2">
              {entities.map((e) => (
                <li key={e} className="font-mono text-xs text-gray-600 bg-gray-50 px-2.5 py-1.5 rounded-md">
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
            className="bg-white rounded-xl border border-gray-200 p-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <Plug size={15} className="text-indigo-500" />
              <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">Adapters</span>
            </div>
            <ul className="flex flex-col gap-2">
              {(adapters.length > 0 ? adapters : [{ name: "Stripe", status: "connected" as const }]).map((a) => (
                <li key={a.name} className="flex items-center justify-between">
                  <span className="text-xs text-gray-700">{a.name}</span>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                    a.status === "connected"
                      ? "bg-green-50 text-green-600"
                      : "bg-blue-50 text-blue-600"
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
          className="flex items-center gap-2 px-6 py-3 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          Open my console
          <ArrowRight size={15} />
        </motion.button>
      </div>
    </div>
  );
}
