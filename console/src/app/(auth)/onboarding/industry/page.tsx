"use client";

import { useRouter } from "next/navigation";
import { useOnboarding, Industry } from "@/components/OnboardingContext";
import OnboardingShell from "@/components/OnboardingShell";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const INDUSTRIES: { id: Industry; label: string; emoji: string }[] = [
  { id: "fintech", label: "Fintech", emoji: "🏦" },
  { id: "saas", label: "SaaS", emoji: "☁️" },
  { id: "ecommerce", label: "E-commerce", emoji: "🛒" },
  { id: "healthcare", label: "Healthcare", emoji: "🏥" },
  { id: "logistics", label: "Logistics", emoji: "📦" },
  { id: "other", label: "Other", emoji: "✦" },
];

export default function IndustryPage() {
  const router = useRouter();
  const { industry, setIndustry } = useOnboarding();

  return (
    <OnboardingShell
      step={1}
      hint="Industry selection maps your console to the most relevant policy templates and example entities."
    >
      <div className="max-w-xl">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2 tracking-tight">
          What industry are you in?
        </h1>
        <p className="text-gray-500 text-sm mb-8">
          We&apos;ll pre-seed your console with relevant policies and demo data.
        </p>

        <div className="grid grid-cols-3 gap-3 mb-10">
          {INDUSTRIES.map((ind) => (
            <button
              key={ind.id}
              onClick={() => setIndustry(ind.id)}
              className={cn(
                "flex flex-col items-center justify-center gap-2.5 py-6 rounded-xl border-2 text-sm font-medium transition-all",
                industry === ind.id
                  ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                  : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
              )}
            >
              <span className="text-2xl">{ind.emoji}</span>
              <span>{ind.label}</span>
            </button>
          ))}
        </div>

        <button
          onClick={() => router.push("/onboarding/actions")}
          disabled={!industry}
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Continue
          <ArrowRight size={15} />
        </button>
      </div>
    </OnboardingShell>
  );
}
