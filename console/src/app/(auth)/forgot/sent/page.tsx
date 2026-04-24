import Link from "next/link";
import { StatisMark } from "@/components/auth/StatisMark";

export const metadata = { title: "Check your email · Statis" };

function receiptId(email: string) {
  let hash = 0;
  for (let i = 0; i < email.length; i++) hash = (hash * 31 + email.charCodeAt(i)) | 0;
  const n = Math.abs(hash % 9999).toString().padStart(4, "0");
  return `RESET-REQUEST-${n}`;
}

export default async function ForgotSentPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;
  const emailStr = email ?? "your inbox";
  const rid = email ? receiptId(email) : "RESET-REQUEST-0000";

  return (
    <div className="w-full max-w-[360px] bg-paper border border-rule rounded-[4px] p-7 shadow-[0_1px_0_rgba(0,0,0,0.02),0_6px_16px_-8px_rgba(60,40,20,0.1)]">
      <div className="flex items-center justify-center gap-2.5 mb-[22px]">
        <StatisMark />
        <span className="font-sans font-semibold text-[17px] tracking-[-0.035em] text-ink">Statis</span>
      </div>

      <h1 className="font-sans font-medium text-[20px] tracking-[-0.025em] leading-tight text-center text-ink mb-1.5">
        Email sent.
      </h1>
      <p className="text-[13px] leading-[1.55] text-ink-soft tracking-[-0.005em] text-center mb-[22px]">
        If an account exists for{" "}
        <code className="font-mono text-[11.5px] bg-bg px-[5px] py-[1px] rounded-[2px] text-ink">
          {emailStr}
        </code>
        , a reset link is on its way. It expires in 30 minutes.
      </p>

      <div className="bg-bg border border-rule border-l-2 border-l-accent rounded-[3px] px-3 py-2.5 mb-4 text-[12px] leading-[1.5] text-ink tracking-[-0.005em]">
        <span className="block font-mono text-[9.5px] tracking-[0.14em] uppercase text-accent font-medium mb-1">
          ◆ Heads up
        </span>
        This event was logged as{" "}
        <code className="font-mono text-[11px] text-ink">{rid}</code>. Every reset attempt lands in
        your receipt chain.
      </div>

      <a
        href="https://mail.google.com"
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full py-2.5 px-3 bg-transparent text-ink border border-ink rounded-[3px] font-mono text-[10.5px] tracking-[0.1em] uppercase font-medium text-center hover:opacity-80 transition-opacity mt-2"
      >
        Open my email
      </a>

      <div className="text-center text-[12px] text-ink-muted mt-[18px] tracking-[-0.005em] leading-[1.55]">
        Didn&apos;t get it?{" "}
        <Link
          href="/forgot"
          className="text-ink-soft border-b border-dotted border-ink-muted hover:text-accent hover:border-accent"
        >
          Resend
        </Link>
        {" · "}
        <Link
          href="/forgot"
          className="text-ink-soft border-b border-dotted border-ink-muted hover:text-accent hover:border-accent"
        >
          Use a different email
        </Link>
      </div>
    </div>
  );
}
