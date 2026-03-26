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
      <div className="w-[320px] shrink-0 bg-[#08080f] border-r border-white/6 flex flex-col justify-between p-10">
        <div>
          <div className="flex items-center gap-2.5 mb-12">
            <Image
              src="/logomark-transparent.png"
              alt="Statis"
              width={26}
              height={26}
              className="rounded-md"
              style={{ filter: "drop-shadow(0 0 6px rgba(0,255,200,0.45))" }}
            />
            <span className="font-semibold text-[15px] tracking-tight text-gradient">Statis</span>
          </div>

          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#4a4a6a] mb-6">
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
                    done ? "bg-[#00ffc8] text-[#080810]" :
                    active ? "bg-[#00ffc8]/10 border-2 border-[#00ffc8] text-[#00ffc8]" :
                    "bg-white/5 text-[#3a3a5a] border border-white/8"
                  )}>
                    {done ? <Check size={12} /> : idx}
                  </div>
                  <div>
                    <p className={cn(
                      "text-sm font-medium",
                      active ? "text-white" : done ? "text-[#6a6a8a]" : "text-[#3a3a5a]"
                    )}>{s.label}</p>
                    <p className="text-[11px] text-[#3a3a5a] mt-0.5">{s.sub}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="bg-[#00ffc8]/6 border border-[#00ffc8]/15 rounded-xl p-4">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[#00ffc8]/70 mb-1">Tip</p>
          <p className="text-xs text-[#8a8a9a] leading-relaxed">{hint}</p>
        </div>
      </div>

      {/* Right content */}
      <div className="flex-1 flex flex-col justify-center p-12">
        {children}
      </div>
    </div>
  );
}
