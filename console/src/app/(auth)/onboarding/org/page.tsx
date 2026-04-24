"use client";

import { useState } from "react";
import Link from "next/link";
import { StatisMark } from "@/components/auth/StatisMark";
import { createOrg, joinOrg } from "./actions";

type Mode = "create" | "join";

export default function OnboardingOrgPage() {
  const [mode, setMode] = useState<Mode>("create");

  return (
    <div className="w-full max-w-[400px] bg-paper border border-rule rounded-[4px] p-7 shadow-[0_1px_0_rgba(0,0,0,0.02),0_6px_16px_-8px_rgba(60,40,20,0.1)]">
      <div className="flex items-center justify-center gap-2.5 mb-[22px]">
        <StatisMark />
        <span className="font-sans font-semibold text-[17px] tracking-[-0.035em] text-ink">Statis</span>
      </div>

      <h1 className="font-sans font-medium text-[20px] tracking-[-0.025em] leading-tight text-center text-ink mb-1.5">
        Welcome.
      </h1>
      <p className="text-[13px] leading-[1.55] text-ink-soft tracking-[-0.005em] text-center mb-[22px]">
        Where should we put you?
      </p>

      <div className="grid grid-cols-2 gap-2.5 mb-3.5">
        <button
          type="button"
          onClick={() => setMode("create")}
          className={
            "rounded-[3px] px-3 py-3.5 text-center text-[12px] leading-[1.4] tracking-[-0.005em] cursor-pointer transition-all " +
            (mode === "create"
              ? "bg-paper border border-accent shadow-[0_0_0_1px_var(--accent)] text-ink"
              : "bg-bg border border-rule text-ink hover:border-ink-muted")
          }
        >
          <div className="w-5 h-5 mx-auto mb-2 flex items-center justify-center text-accent font-mono text-[16px]">+</div>
          <strong className="block font-medium text-[13px] mb-0.5">Create new</strong>
          <span className="text-ink-muted text-[11px]">Start an org</span>
        </button>

        <button
          type="button"
          onClick={() => setMode("join")}
          className={
            "rounded-[3px] px-3 py-3.5 text-center text-[12px] leading-[1.4] tracking-[-0.005em] cursor-pointer transition-all " +
            (mode === "join"
              ? "bg-paper border border-accent shadow-[0_0_0_1px_var(--accent)] text-ink"
              : "bg-bg border border-rule text-ink hover:border-ink-muted")
          }
        >
          <div className="w-5 h-5 mx-auto mb-2 flex items-center justify-center text-accent font-mono text-[16px]">◈</div>
          <strong className="block font-medium text-[13px] mb-0.5">Join existing</strong>
          <span className="text-ink-muted text-[11px]">Use an invite code</span>
        </button>
      </div>

      {mode === "create" ? (
        <form action={createOrg}>
          <input type="hidden" name="mode" value="create" />

          <div className="mb-3">
            <label htmlFor="name" className="block font-mono text-[9.5px] tracking-[0.14em] uppercase text-ink-muted mb-[5px]">
              Organization name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              placeholder="SurveyMonkey"
              className="w-full py-2 px-[11px] bg-paper border border-rule rounded-[3px] font-sans text-[13px] text-ink tracking-[-0.005em] placeholder:text-ink-muted focus:outline-none focus:border-accent focus:ring-2 focus:ring-[rgba(184,68,46,0.15)]"
            />
            <p className="text-[11px] leading-[1.4] text-ink-muted mt-1 tracking-[-0.005em]">
              Used in your dashboard URL and receipts.
            </p>
          </div>

          <div className="mb-3">
            <label htmlFor="role" className="block font-mono text-[9.5px] tracking-[0.14em] uppercase text-ink-muted mb-[5px]">
              Your role
            </label>
            <input
              id="role"
              name="role"
              type="text"
              placeholder="Senior Data Engineer"
              className="w-full py-2 px-[11px] bg-paper border border-rule rounded-[3px] font-sans text-[13px] text-ink tracking-[-0.005em] placeholder:text-ink-muted focus:outline-none focus:border-accent focus:ring-2 focus:ring-[rgba(184,68,46,0.15)]"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-3 bg-accent text-paper border border-accent rounded-[3px] font-mono text-[10.5px] tracking-[0.1em] uppercase font-medium hover:opacity-90 transition-opacity mt-2"
          >
            Create org → enter console
          </button>

          <div className="text-center text-[12px] text-ink-muted mt-[18px] tracking-[-0.005em]">
            <button
              type="button"
              onClick={() => setMode("join")}
              className="text-ink-soft border-b border-dotted border-ink-muted hover:text-accent hover:border-accent"
            >
              Have an invite code instead?
            </button>
          </div>
        </form>
      ) : (
        <form action={joinOrg}>
          <div className="mb-3">
            <label htmlFor="code" className="block font-mono text-[9.5px] tracking-[0.14em] uppercase text-ink-muted mb-[5px]">
              Invite code
            </label>
            <input
              id="code"
              name="code"
              type="text"
              required
              placeholder="STATIS-XXXX-XXXX"
              className="w-full py-2 px-[11px] bg-paper border border-rule rounded-[3px] font-mono text-[13px] text-ink tracking-[0.02em] uppercase placeholder:text-ink-muted focus:outline-none focus:border-accent focus:ring-2 focus:ring-[rgba(184,68,46,0.15)]"
            />
            <p className="text-[11px] leading-[1.4] text-ink-muted mt-1 tracking-[-0.005em]">
              Ask your admin or look in your invite email.
            </p>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-3 bg-accent text-paper border border-accent rounded-[3px] font-mono text-[10.5px] tracking-[0.1em] uppercase font-medium hover:opacity-90 transition-opacity mt-2"
          >
            Join org → enter console
          </button>

          <div className="text-center text-[12px] text-ink-muted mt-[18px] tracking-[-0.005em]">
            <button
              type="button"
              onClick={() => setMode("create")}
              className="text-ink-soft border-b border-dotted border-ink-muted hover:text-accent hover:border-accent"
            >
              Start a new org instead?
            </button>
            <br />
            <Link href="/login" className="text-ink-muted text-[11px] hover:text-accent">
              Back to sign in
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
