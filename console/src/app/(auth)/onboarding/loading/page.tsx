"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useOnboarding } from "@/components/OnboardingContext";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

function getSetupSteps(
  industry: string | null,
  actions: string[],
  systems: string[]
) {
  const ruleMap: Record<string, string> = {
    issue_refund: "refund_eligibility_v1",
    apply_discount: "churn_retention_v1",
    send_notification: "notify_v1",
    provision_instance: "auto_provision_v1",
    update_account: "account_update_v1",
    create_ticket: "ticket_create_v1",
    trigger_webhook: "webhook_fire_v1",
    schedule_task: "task_schedule_v1",
    flag_for_review: "vip_escalation_v1",
  };

  const entityMap: Record<string, string[]> = {
    fintech: ["acct-42", "cust-771", "acct-88"],
    saas: ["acct-42", "acct-88", "tenant-9"],
    ecommerce: ["cust-771", "cust-330", "cust-42"],
    healthcare: ["patient-001", "patient-002"],
    logistics: ["tenant-9", "tenant-22"],
    other: ["entity-001", "entity-002"],
  };

  const entities = entityMap[industry ?? "fintech"] ?? ["acct-42", "cust-771"];
  const rules = actions.slice(0, 3).map((a) => ruleMap[a]).filter(Boolean);
  const adapters = systems.slice(0, 2);

  return [
    `Initialising workspace...`,
    `Seeding policy rules: ${rules.slice(0, 2).join(", ") || "churn_retention_v1"}`,
    `Creating entity registry: ${entities.join(", ")}`,
    `Configuring adapters: ${adapters.join(", ") || "stripe"}`,
    `Starting event bus...`,
    `Console ready.`,
  ];
}

export default function LoadingPage() {
  const router = useRouter();
  const { industry, actions, systems } = useOnboarding();
  const steps = getSetupSteps(industry, actions, systems);
  const [visible, setVisible] = useState<number[]>([]);
  const [done, setDone] = useState(false);

  useEffect(() => {
    steps.forEach((_, i) => {
      setTimeout(() => {
        setVisible((v) => [...v, i]);
        if (i === steps.length - 1) {
          setTimeout(() => setDone(true), 600);
        }
      }, i * 650);
    });
  }, []);

  useEffect(() => {
    if (done) {
      setTimeout(() => router.push("/onboarding/ready"), 800);
    }
  }, [done]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center gap-2 mb-10">
          <span className="font-semibold text-[15px] tracking-tight text-white">
            statis
            <span className="inline-block ml-[1px] animate-pulse" style={{ width: "7px", height: "13px", background: "#ffffff" }} />
          </span>
          <span className="text-[#444444] text-sm font-mono ml-2">Setting up your console...</span>
        </div>

        {/* Terminal log */}
        <div className="bg-[#111111] rounded overflow-hidden border border-[#1a1a1a] shadow-2xl">
          <div className="flex items-center gap-1.5 px-4 py-3 border-b border-[#1a1a1a]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#333]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#262626]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#1f1f1f]" />
            <span className="ml-2 text-[11px] text-[#444444] font-mono">statis bootstrap</span>
          </div>

          <div className="p-5 font-mono text-[13px] min-h-[220px] space-y-2">
            <AnimatePresence>
              {steps.map((step, i) => (
                visible.includes(i) ? (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center gap-3"
                  >
                    <span className="text-[#d4d4d4]">$</span>
                    <span className={i === steps.length - 1 ? "text-[#d4d4d4] font-medium" : "text-[#888888]"}>
                      {step}
                    </span>
                    {i < steps.length - 1 && (
                      <CheckCircle2 size={12} className="text-emerald-400 shrink-0 ml-auto" />
                    )}
                  </motion.div>
                ) : null
              ))}
            </AnimatePresence>

            {visible.length < steps.length && (
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.6, repeat: Infinity }}
                className="inline-block w-1.5 h-4 bg-[#444444] rounded-sm ml-4"
              />
            )}
          </div>
        </div>

        {done && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-sm text-[#444444] mt-6"
          >
            Redirecting to your console...
          </motion.p>
        )}
      </div>
    </div>
  );
}
