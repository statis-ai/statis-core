"use client";

import { useRouter } from "next/navigation";
import { useOnboarding, ProductionSystem } from "@/components/OnboardingContext";
import OnboardingShell from "@/components/OnboardingShell";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const SYSTEMS: { id: ProductionSystem; label: string; desc: string }[] = [
  { id: "stripe", label: "Stripe", desc: "Payments & billing" },
  { id: "salesforce", label: "Salesforce", desc: "CRM & accounts" },
  { id: "zendesk", label: "Zendesk", desc: "Support tickets" },
  { id: "hubspot", label: "HubSpot", desc: "Marketing & deals" },
  { id: "aws", label: "AWS", desc: "Cloud infrastructure" },
  { id: "custom", label: "Custom API", desc: "Bring your own adapter" },
];

export default function SystemsPage() {
  const router = useRouter();
  const { systems, toggleSystem } = useOnboarding();

  return (
    <OnboardingShell
      step={2}
      hint="Connected systems become adapters in Statis. Each one gets a pre-built connector with auth and retry logic."
    >
      <div className="max-w-xl">
        <h1 className="text-2xl font-semibold text-white mb-2 tracking-tight">
          Which production systems do you use?
        </h1>
        <p className="text-[#888888] text-sm mb-8">
          These will appear as ready-to-connect adapters in your console.
        </p>

        <div className="grid grid-cols-2 gap-3 mb-10">
          {SYSTEMS.map((sys) => {
            const selected = systems.includes(sys.id);
            return (
              <button
                key={sys.id}
                onClick={() => toggleSystem(sys.id)}
                className={cn(
                  "flex items-center gap-3 p-4 rounded border-2 text-left transition-all",
                  selected
                    ? "border-[#d4d4d4] bg-white/[0.06]"
                    : "border-[#1a1a1a] bg-white/[0.02] hover:border-white/20"
                )}
              >
                <div>
                  <p className={cn("text-sm font-semibold", selected ? "text-[#d4d4d4]" : "text-white")}>{sys.label}</p>
                  <p className="text-xs text-[#444444] mt-0.5">{sys.desc}</p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/onboarding/actions")}
            className="flex items-center gap-1.5 text-sm text-[#444444] hover:text-white transition-colors"
          >
            <ArrowLeft size={14} />
            Back
          </button>
          <button
            onClick={() => router.push("/onboarding/loading")}
            disabled={systems.length === 0}
            className="flex items-center gap-2 px-6 py-2.5 rounded bg-[#d4d4d4] text-[#0a0a0a] text-sm font-semibold hover:bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Set up my console
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </OnboardingShell>
  );
}
