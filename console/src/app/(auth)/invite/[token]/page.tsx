import Link from "next/link";
import { StatisMark } from "@/components/auth/StatisMark";
import { getWorkOS } from "@workos-inc/authkit-nextjs";
import { acceptInvite } from "./actions";

export const metadata = { title: "You've been invited · Statis" };

type InvitePreview = {
  valid: boolean;
  state?: "pending" | "accepted" | "expired" | "revoked";
  email?: string;
  orgName?: string;
  expiresAt?: string;
};

async function loadInvite(token: string): Promise<InvitePreview> {
  try {
    const inv = await getWorkOS().userManagement.findInvitationByToken(token);
    let orgName: string | undefined;
    if (inv.organizationId) {
      try {
        const org = await getWorkOS().organizations.getOrganization(inv.organizationId);
        orgName = org.name;
      } catch {
        /* ignore */
      }
    }
    return {
      valid: inv.state === "pending",
      state: inv.state,
      email: inv.email,
      orgName,
      expiresAt: inv.expiresAt,
    };
  } catch {
    return { valid: false };
  }
}

function formatExpiry(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  const hrs = Math.max(0, Math.round((d.getTime() - Date.now()) / 36e5));
  if (hrs < 1) return "less than an hour";
  if (hrs < 48) return `${hrs} hour${hrs === 1 ? "" : "s"}`;
  return `${Math.round(hrs / 24)} days`;
}

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const inv = await loadInvite(token);

  if (!inv.valid) {
    const label =
      inv.state === "accepted"
        ? "already accepted"
        : inv.state === "expired"
          ? "expired"
          : inv.state === "revoked"
            ? "revoked"
            : "not valid";
    return (
      <div className="w-full max-w-[360px] bg-paper border border-rule rounded-[4px] p-7 shadow-[0_1px_0_rgba(0,0,0,0.02),0_6px_16px_-8px_rgba(60,40,20,0.1)]">
        <div className="flex items-center justify-center gap-2.5 mb-[22px]">
          <StatisMark />
          <span className="font-sans font-semibold text-[17px] tracking-[-0.035em] text-ink">Statis</span>
        </div>
        <h1 className="font-sans font-medium text-[20px] tracking-[-0.025em] leading-tight text-center text-ink mb-1.5">
          Invite {label}.
        </h1>
        <p className="text-[13px] leading-[1.55] text-ink-soft tracking-[-0.005em] text-center mb-[22px]">
          Ask your admin to send a fresh invite, or sign in if you&apos;re already a member.
        </p>
        <Link
          href="/login"
          className="block w-full py-2.5 px-3 bg-accent text-paper border border-accent rounded-[3px] font-mono text-[10.5px] tracking-[0.1em] uppercase font-medium text-center hover:opacity-90 transition-opacity"
        >
          Go to sign in
        </Link>
      </div>
    );
  }

  const orgName = inv.orgName ?? "your team";
  const expires = formatExpiry(inv.expiresAt);

  return (
    <div className="w-full max-w-[380px] bg-paper border border-rule rounded-[4px] p-7 shadow-[0_1px_0_rgba(0,0,0,0.02),0_6px_16px_-8px_rgba(60,40,20,0.1)]">
      <div className="flex items-center justify-center gap-2.5 mb-[22px]">
        <StatisMark />
        <span className="font-sans font-semibold text-[17px] tracking-[-0.035em] text-ink">Statis</span>
      </div>

      <div className="bg-[rgba(29,58,46,0.06)] border border-seal rounded-[3px] px-4 py-3.5 text-center mb-4">
        <div className="w-9 h-9 mx-auto mb-2.5 rounded-full bg-seal flex items-center justify-center text-paper font-mono text-[16px]">
          ◈
        </div>
        <div className="font-sans font-medium text-[15px] tracking-[-0.02em] text-ink mb-1">
          You&apos;re invited to <span className="text-seal">{orgName}</span>.
        </div>
        <div className="text-[12px] leading-[1.5] text-ink-soft tracking-[-0.005em]">
          Invited as{" "}
          <code className="font-mono text-[11.5px] bg-paper px-[5px] py-[1px] rounded-[2px] text-ink border border-rule">
            {inv.email}
          </code>
        </div>
      </div>

      <div className="bg-bg border border-rule border-l-2 border-l-accent rounded-[3px] px-3 py-2.5 mb-4 text-[12px] leading-[1.5] text-ink tracking-[-0.005em]">
        <span className="block font-mono text-[9.5px] tracking-[0.14em] uppercase text-accent font-medium mb-1">
          ◆ What happens next
        </span>
        Create your account with this email. You&apos;ll land directly inside{" "}
        <strong className="font-medium">{orgName}</strong> — no org setup needed.
        {expires ? (
          <>
            {" "}
            Invite expires in <strong className="font-medium">{expires}</strong>.
          </>
        ) : null}
      </div>

      <form action={acceptInvite}>
        <input type="hidden" name="token" value={token} />
        <input type="hidden" name="email" value={inv.email ?? ""} />
        <input type="hidden" name="orgName" value={orgName} />
        <button
          type="submit"
          className="w-full py-2.5 px-3 bg-accent text-paper border border-accent rounded-[3px] font-mono text-[10.5px] tracking-[0.1em] uppercase font-medium hover:opacity-90 transition-opacity mt-2"
        >
          Accept & create account →
        </button>
      </form>

      <div className="text-center text-[12px] text-ink-muted mt-[18px] tracking-[-0.005em] leading-[1.55]">
        Already have a Statis account?{" "}
        <Link
          href={`/login?invite=${token}`}
          className="text-ink-soft border-b border-dotted border-ink-muted hover:text-accent hover:border-accent"
        >
          Sign in to accept
        </Link>
      </div>
    </div>
  );
}
