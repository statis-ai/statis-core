"use client";

import Image from "next/image";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { label: "Your industry", sub: "Personalise policy templates" },
  { label: "Action types", sub: "Map to pre-built rules" },
  { label: "Production systems", sub: "Ready-to-connect adapters" },
];

interface Props {
  step: 1 | 2 | 3;
  hint: string;
  children: React.ReactNode;
}

export default function OnboardingShell({ step, hint, children }: Props) {
  return (
    <div className="min-h-screen flex">
      {/* Left rail */}
      <div className="w-[320px] shrink-0 bg-white border-r border-gray-100 flex flex-col justify-between p-10">
        <div>
          <div className="flex items-center gap-2.5 mb-12">
            <Image src="/logomark-light.png" alt="Statis" width={26} height={26} />
            <span className="text-gray-900 font-semibold text-[15px] tracking-tight font-serif">Statis</span>
          </div>

          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-6">
            Setup · Step {step} of 3
          </p>

          <ol className="flex flex-col gap-5">
            {STEPS.map((s, i) => {
              const idx = i + 1;
              const done = idx < step;
              const active = idx === step;
              return (
                <li key={i} className="flex items-start gap-3">
                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-[11px] font-semibold",
                    done ? "bg-indigo-600 text-white" :
                    active ? "bg-indigo-50 border-2 border-indigo-600 text-indigo-600" :
                    "bg-gray-100 text-gray-400"
                  )}>
                    {done ? <Check size={12} /> : idx}
                  </div>
                  <div>
                    <p className={cn(
                      "text-sm font-medium",
                      active ? "text-gray-900" : done ? "text-gray-500" : "text-gray-400"
                    )}>{s.label}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{s.sub}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="bg-indigo-50 rounded-xl p-4">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-indigo-400 mb-1">Tip</p>
          <p className="text-xs text-indigo-700 leading-relaxed">{hint}</p>
        </div>
      </div>

      {/* Right content */}
      <div className="flex-1 flex flex-col justify-center p-12 bg-gray-50">
        {children}
      </div>
    </div>
  );
}
