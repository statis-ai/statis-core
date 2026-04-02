"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { label: "Action types", sub: "Map to pre-built rules" },
  { label: "Production systems", sub: "Ready-to-connect adapters" },
];

interface Props {
  step: 1 | 2;
  hint: string;
  children: React.ReactNode;
}

export default function OnboardingShell({ step, hint, children }: Props) {
  return (
    <div className="min-h-screen flex">
      {/* Left rail */}
      <div className="w-[320px] shrink-0 bg-[#0a0a0a] border-r border-[#1a1a1a] flex flex-col justify-between p-10">
        <div>
          <div className="flex items-center gap-2 mb-12">
            <span className="font-semibold text-[15px] tracking-tight text-white">
              statis
              <span className="inline-block ml-[1px] animate-pulse" style={{ width: "7px", height: "13px", background: "#ffffff" }} />
            </span>
          </div>

          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#444444] mb-6">
            Setup · Step {step} of 2
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
                    done ? "bg-[#d4d4d4] text-[#0a0a0a]" :
                    active ? "bg-white/[0.06] border-2 border-[#d4d4d4] text-[#d4d4d4]" :
                    "bg-white/5 text-[#444444] border border-[#1a1a1a]"
                  )}>
                    {done ? <Check size={12} /> : idx}
                  </div>
                  <div>
                    <p className={cn(
                      "text-sm font-medium",
                      active ? "text-white" : done ? "text-[#888888]" : "text-[#444444]"
                    )}>{s.label}</p>
                    <p className="text-[11px] text-[#444444] mt-0.5">{s.sub}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="bg-white/[0.04] border border-[#1a1a1a] rounded p-4">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[#888888] mb-1">Tip</p>
          <p className="text-xs text-[#888888] leading-relaxed">{hint}</p>
        </div>
      </div>

      {/* Right content */}
      <div className="flex-1 flex flex-col justify-center p-12">
        {children}
      </div>
    </div>
  );
}
