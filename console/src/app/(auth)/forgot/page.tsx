import Link from "next/link";
import { StatisMark } from "@/components/auth/StatisMark";
import { requestPasswordReset } from "./actions";

export const metadata = { title: "Reset your password · Statis" };

export default function ForgotPage() {
  return (
    <div className="w-full max-w-[340px] bg-paper border border-rule rounded-[4px] p-7 shadow-[0_1px_0_rgba(0,0,0,0.02),0_6px_16px_-8px_rgba(60,40,20,0.1)]">
      <div className="flex items-center justify-center gap-2.5 mb-[22px]">
        <StatisMark />
        <span className="font-sans font-semibold text-[17px] tracking-[-0.035em] text-ink">Statis</span>
      </div>

      <h1 className="font-sans font-medium text-[20px] tracking-[-0.025em] leading-tight text-center text-ink mb-1.5">
        Reset your password.
      </h1>
      <p className="text-[13px] leading-[1.55] text-ink-soft tracking-[-0.005em] text-center mb-[22px]">
        We&apos;ll email you a one-time link.
      </p>

      <form action={requestPasswordReset}>
        <div className="mb-3">
          <label htmlFor="email" className="block font-mono text-[9.5px] tracking-[0.14em] uppercase text-ink-muted mb-[5px]">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="w-full py-2 px-[11px] bg-paper border border-rule rounded-[3px] font-sans text-[13px] text-ink tracking-[-0.005em] focus:outline-none focus:border-accent focus:ring-2 focus:ring-[rgba(184,68,46,0.15)]"
          />
        </div>

        <button
          type="submit"
          className="w-full py-2.5 px-3 bg-accent text-paper border border-accent rounded-[3px] font-mono text-[10.5px] tracking-[0.1em] uppercase font-medium hover:opacity-90 transition-opacity mt-2"
        >
          Send reset link
        </button>
      </form>

      <div className="text-center text-[12px] text-ink-muted mt-[18px] tracking-[-0.005em]">
        <Link href="/login" className="text-ink-soft border-b border-dotted border-ink-muted hover:text-accent hover:border-accent">
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
