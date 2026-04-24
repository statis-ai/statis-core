import Link from "next/link";
import { StatisMark } from "@/components/auth/StatisMark";
import { PasswordStrength } from "@/components/auth/PasswordStrength";
import { resetPassword } from "./actions";

export const metadata = { title: "Choose a new password · Statis" };

const ERRORS: Record<string, string> = {
  short: "Password must be at least 12 characters.",
  mismatch: "Passwords didn't match. Try again.",
  invalid: "This reset link is invalid or expired. Request a new one.",
  missing: "Missing fields. Fill both password boxes.",
};

export default async function ResetPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ error?: string; email?: string }>;
}) {
  const { token } = await params;
  const { error, email } = await searchParams;
  const errMsg = error ? ERRORS[error] ?? "Something went wrong. Try again." : null;

  return (
    <div className="w-full max-w-[360px] bg-paper border border-rule rounded-[4px] p-7 shadow-[0_1px_0_rgba(0,0,0,0.02),0_6px_16px_-8px_rgba(60,40,20,0.1)]">
      <div className="flex items-center justify-center gap-2.5 mb-[22px]">
        <StatisMark />
        <span className="font-sans font-semibold text-[17px] tracking-[-0.035em] text-ink">Statis</span>
      </div>

      <h1 className="font-sans font-medium text-[20px] tracking-[-0.025em] leading-tight text-center text-ink mb-1.5">
        Choose a new password.
      </h1>
      {email ? (
        <p className="text-[12px] leading-[1.55] text-ink-soft tracking-[-0.005em] text-center mb-[22px]">
          for{" "}
          <code className="font-mono text-[11.5px] bg-bg px-[5px] py-[1px] rounded-[2px] text-ink">
            {email}
          </code>
        </p>
      ) : (
        <div className="mb-[22px]" />
      )}

      {errMsg ? (
        <div className="bg-[rgba(184,68,46,0.06)] border border-accent rounded-[3px] px-3 py-2 mb-3 text-[12px] leading-[1.5] text-accent tracking-[-0.005em]">
          {errMsg}
        </div>
      ) : null}

      <form action={resetPassword}>
        <input type="hidden" name="token" value={token} />

        <div className="mb-3">
          <PasswordStrength />
        </div>

        <div className="mb-3">
          <label htmlFor="confirm" className="block font-mono text-[9.5px] tracking-[0.14em] uppercase text-ink-muted mb-[5px]">
            Confirm password
          </label>
          <input
            id="confirm"
            name="confirm"
            type="password"
            required
            autoComplete="new-password"
            minLength={12}
            className="w-full py-2 px-[11px] bg-paper border border-rule rounded-[3px] font-sans text-[13px] text-ink tracking-[-0.005em] focus:outline-none focus:border-accent focus:ring-2 focus:ring-[rgba(184,68,46,0.15)]"
          />
        </div>

        <div className="bg-[rgba(201,138,43,0.08)] border border-rule border-l-2 border-l-amber rounded-[3px] px-3 py-2.5 mb-4 text-[12px] leading-[1.5] text-ink tracking-[-0.005em]">
          <span className="block font-mono text-[9.5px] tracking-[0.14em] uppercase text-amber font-medium mb-1">
            ⚠ On reset
          </span>
          All active sessions will be signed out. You&apos;ll sign back in with the new password on this
          device.
        </div>

        <button
          type="submit"
          className="w-full py-2.5 px-3 bg-accent text-paper border border-accent rounded-[3px] font-mono text-[10.5px] tracking-[0.1em] uppercase font-medium hover:opacity-90 transition-opacity mt-2"
        >
          Update password & sign in
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
