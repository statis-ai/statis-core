import Link from "next/link";
import { cookies } from "next/headers";
import { StatisMark } from "@/components/auth/StatisMark";

export const metadata = { title: "Welcome · Statis" };

type OrgDraft = {
  name?: string;
  slug?: string;
  role?: string;
  mode?: "create" | "join";
  inviteCode?: string;
};

export default async function OnboardingPage() {
  const store = await cookies();
  const raw = store.get("statis_org_draft")?.value;
  let draft: OrgDraft = {};
  try {
    if (raw) draft = JSON.parse(raw) as OrgDraft;
  } catch {
    /* ignore */
  }

  const orgName = draft.name ?? (draft.mode === "join" ? "your org" : "Statis");
  const joining = draft.mode === "join";

  return (
    <div className="w-full max-w-[400px] bg-paper border border-rule rounded-[4px] p-7 shadow-[0_1px_0_rgba(0,0,0,0.02),0_6px_16px_-8px_rgba(60,40,20,0.1)]">
      <div className="flex items-center justify-center gap-2.5 mb-[22px]">
        <StatisMark />
        <span className="font-sans font-semibold text-[17px] tracking-[-0.035em] text-ink">Statis</span>
      </div>

      <div className="bg-[rgba(29,58,46,0.06)] border border-seal rounded-[3px] px-4 py-3.5 text-center mb-4">
        <div className="w-9 h-9 mx-auto mb-2.5 rounded-full bg-seal flex items-center justify-center text-paper font-mono text-[18px]">
          ✓
        </div>
        <div className="font-sans font-medium text-[14px] tracking-[-0.015em] text-ink mb-1">
          {joining ? `Joined ${orgName}.` : `${orgName} created.`}
        </div>
        <div className="text-[12px] leading-[1.5] text-ink-soft tracking-[-0.005em]">
          {joining
            ? "You've been added to the workspace. Your first environment is live."
            : "Prod, staging, and dev environments provisioned. Your first API key is ready."}
        </div>
      </div>

      <div className="bg-bg border border-rule border-l-2 border-l-accent rounded-[3px] px-3 py-2.5 mb-4 text-[12px] leading-[1.5] text-ink tracking-[-0.005em]">
        <span className="block font-mono text-[9.5px] tracking-[0.14em] uppercase text-accent font-medium mb-1">
          ◆ Next · 3 steps · ~8 min
        </span>
        <strong className="font-medium">Connect your Kit.</strong> Paste the key into your code, run once, and your first receipt will appear here automatically.
      </div>

      <Link
        href="/home"
        className="block w-full py-2.5 px-3 bg-accent text-paper border border-accent rounded-[3px] font-mono text-[10.5px] tracking-[0.1em] uppercase font-medium hover:opacity-90 transition-opacity mt-2 text-center"
      >
        Start onboarding →
      </Link>

      <div className="text-center text-[12px] text-ink-muted mt-[18px] tracking-[-0.005em]">
        <Link href="/home" className="text-ink-soft border-b border-dotted border-ink-muted hover:text-accent hover:border-accent">
          Skip to console · no receipts yet
        </Link>
      </div>
    </div>
  );
}
