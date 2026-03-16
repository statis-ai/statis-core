"use client";

import { useRouter } from "next/navigation";
import { useOnboarding, ProductionSystem } from "@/components/OnboardingContext";
import OnboardingShell from "@/components/OnboardingShell";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const SYSTEMS: { id: ProductionSystem; label: string; desc: string; logo: string }[] = [
  { id: "stripe", label: "Stripe", desc: "Payments & billing", logo: "💳" },
  { id: "salesforce", label: "Salesforce", desc: "CRM & accounts", logo: "☁️" },
  { id: "zendesk", label: "Zendesk", desc: "Support tickets", logo: "🎫" },
  { id: "hubspot", label: "HubSpot", desc: "Marketing & deals", logo: "🟠" },
  { id: "aws", label: "AWS", desc: "Cloud infrastructure", logo: "⚡" },
  { id: "custom", label: "Custom API", desc: "Bring your own adapter", logo: "🔌" },
];

export default function SystemsPage() {
  const router = useRouter();
  const { systems, toggleSystem } = useOnboarding();

  return (
    <OnboardingShell
      step={3}
      hint="Connected systems become adapters in Statis. Each one gets a pre-built connector with auth and retry logic."
    >
      <div className="max-w-xl">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2 tracking-tight">
          Which production systems do you use?
        </h1>
        <p className="text-gray-500 text-sm mb-8">
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
                  "flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all",
                  selected
                    ? "border-indigo-600 bg-indigo-50"
                    : "border-gray-200 bg-white hover:border-gray-300"
                )}
              >
                <span className="text-2xl">{sys.logo}</span>
                <div>
                  <p className={cn(
                    "text-sm font-semibold",
                    selected ? "text-indigo-700" : "text-gray-800"
                  )}>{sys.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{sys.desc}</p>
                </div>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => router.push("/onboarding/loading")}
          disabled={systems.length === 0}
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Set up my console
          <ArrowRight size={15} />
        </button>
      </div>
    </OnboardingShell>
  );
}
