"use client";

import { useRouter } from "next/navigation";
import { useOnboarding, ActionType } from "@/components/OnboardingContext";
import OnboardingShell from "@/components/OnboardingShell";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const ACTIONS: { id: ActionType; label: string; rule: string }[] = [
  { id: "issue_refund", label: "Issue refund", rule: "refund_eligibility_v1" },
  { id: "apply_discount", label: "Apply discount", rule: "churn_retention_v1" },
  { id: "send_notification", label: "Send notification", rule: "notify_v1" },
  { id: "provision_instance", label: "Provision instance", rule: "auto_provision_v1" },
  { id: "update_account", label: "Update account", rule: "account_update_v1" },
  { id: "create_ticket", label: "Create ticket", rule: "ticket_create_v1" },
  { id: "trigger_webhook", label: "Trigger webhook", rule: "webhook_fire_v1" },
  { id: "schedule_task", label: "Schedule task", rule: "task_schedule_v1" },
  { id: "flag_for_review", label: "Flag for review", rule: "vip_escalation_v1" },
];

export default function ActionsPage() {
  const router = useRouter();
  const { actions, toggleAction } = useOnboarding();

  return (
    <OnboardingShell
      step={1}
      hint="Each action type maps to a pre-built governance rule. You can customise conditions after setup."
    >
      <div className="max-w-xl">
        <h1 className="text-2xl font-semibold text-white mb-2 tracking-tight">
          What actions will your agents take?
        </h1>
        <p className="text-[#888888] text-sm mb-8">
          Select all that apply. We&apos;ll create rules for each one.
        </p>

        <div className="flex flex-wrap gap-2.5 mb-10">
          {ACTIONS.map((action) => {
            const selected = actions.includes(action.id);
            return (
              <button
                key={action.id}
                onClick={() => toggleAction(action.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-all",
                  selected
                    ? "border-[#d4d4d4] bg-white/[0.06] text-[#d4d4d4]"
                    : "border-[#1a1a1a] bg-transparent text-[#888888] hover:border-white/20 hover:text-white"
                )}
              >
                <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", selected ? "bg-[#d4d4d4]" : "bg-[#444444]")} />
                {action.label}
              </button>
            );
          })}
        </div>

        {actions.length > 0 && (
          <div className="mb-8 p-4 bg-white/[0.04] border border-[#1a1a1a] rounded">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-[#888888] mb-2">
              Rules to be created
            </p>
            <div className="flex flex-wrap gap-1.5">
              {actions.map((a) => {
                const found = ACTIONS.find((x) => x.id === a);
                return found ? (
                  <span key={a} className="font-mono text-[11px] text-[#d4d4d4]/80 bg-white/[0.06] px-2 py-0.5 rounded border border-[#1a1a1a]">
                    {found.rule}
                  </span>
                ) : null;
              })}
            </div>
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/auth")}
            className="flex items-center gap-1.5 text-sm text-[#444444] hover:text-white transition-colors"
          >
            <ArrowLeft size={14} />
            Back
          </button>
          <button
            onClick={() => router.push("/onboarding/systems")}
            disabled={actions.length === 0}
            className="flex items-center gap-2 px-6 py-2.5 rounded bg-[#d4d4d4] text-[#0a0a0a] text-sm font-semibold hover:bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Continue
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </OnboardingShell>
  );
}
