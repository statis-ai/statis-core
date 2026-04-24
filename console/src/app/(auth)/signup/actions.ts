"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getWorkOS } from "@workos-inc/authkit-nextjs";

type OAuthProvider = "GoogleOAuth" | "GitHubOAuth";

const ORG_DRAFT_COOKIE = "statis_org_draft";
const INVITE_COOKIE = "statis_invite";

function baseRedirectUri() {
  return process.env.WORKOS_REDIRECT_URI ?? "http://localhost:3001/auth/callback";
}

type InviteCtx = { token: string; email?: string; orgName?: string };

async function readInvite(): Promise<InviteCtx | null> {
  const store = await cookies();
  const raw = store.get(INVITE_COOKIE)?.value;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed.token === "string" && parsed.token) return parsed as InviteCtx;
  } catch {
    /* ignore */
  }
  return null;
}

async function stashJoinDraft(invite: InviteCtx) {
  const store = await cookies();
  store.set(
    ORG_DRAFT_COOKIE,
    JSON.stringify({
      mode: "join",
      inviteCode: invite.token,
      name: invite.orgName,
      createdAt: Date.now(),
    }),
    { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 },
  );
}

export async function signUpWithOAuth(provider: OAuthProvider) {
  const invite = await readInvite();
  const returnPathname = invite ? "/onboarding" : "/onboarding/org";
  if (invite) await stashJoinDraft(invite);

  const url = getWorkOS().userManagement.getAuthorizationUrl({
    provider,
    clientId: process.env.WORKOS_CLIENT_ID!,
    redirectUri: baseRedirectUri(),
    state: JSON.stringify({ returnPathname }),
  });
  redirect(url);
}

export async function signUpWithEmail(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) return;

  const invite = await readInvite();
  if (invite) await stashJoinDraft(invite);

  const url = getWorkOS().userManagement.getAuthorizationUrl({
    provider: "authkit",
    clientId: process.env.WORKOS_CLIENT_ID!,
    redirectUri: baseRedirectUri(),
    loginHint: email,
    screenHint: "sign-up",
    state: invite ? JSON.stringify({ returnPathname: "/onboarding" }) : undefined,
  });
  redirect(url);
}
