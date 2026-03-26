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
      step={2}
      hint="Each action type maps to a pre-built governance rule. You can customise conditions after setup."
    >
      <div className="max-w-xl">
        <h1 className="text-2xl font-semibold text-white mb-2 tracking-tight">
          What actions will your agents take?
        </h1>
        <p className="text-[#6a6a8a] text-sm mb-8">
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
                    ? "border-[#00ffc8] bg-[#00ffc8]/10 text-[#00ffc8]"
                    : "border-white/8 bg-transparent text-[#6a6a8a] hover:border-white/20 hover:text-white"
                )}
              >
                <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", selected ? "bg-[#00ffc8]" : "bg-[#3a3a5a]")} />
                {action.label}
              </button>
            );
          })}
        </div>

        {actions.length > 0 && (
          <div className="mb-8 p-4 bg-[#00ffc8]/5 border border-[#00ffc8]/15 rounded-lg">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-[#00ffc8]/70 mb-2">
              Rules to be created
            </p>
            <div className="flex flex-wrap gap-1.5">
              {actions.map((a) => {
                const found = ACTIONS.find((x) => x.id === a);
                return found ? (
                  <span key={a} className="font-mono text-[11px] text-[#00ffc8]/80 bg-[#00ffc8]/8 px-2 py-0.5 rounded border border-[#00ffc8]/15">
                    {found.rule}
                  </span>
                ) : null;
              })}
            </div>
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/onboarding/industry")}
            className="flex items-center gap-1.5 text-sm text-[#5a5a7a] hover:text-white transition-colors"
          >
            <ArrowLeft size={14} />
            Back
          </button>
          <button
            onClick={() => router.push("/onboarding/systems")}
            disabled={actions.length === 0}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#00ffc8] text-[#080810] text-sm font-semibold hover:bg-[#00ffc8]/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Continue
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </OnboardingShell>
  );
}
