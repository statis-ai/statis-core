"use server";

import { redirect } from "next/navigation";
import { getWorkOS } from "@workos-inc/authkit-nextjs";

type OAuthProvider = "GoogleOAuth" | "GitHubOAuth";

function baseRedirectUri() {
  return process.env.WORKOS_REDIRECT_URI ?? "http://localhost:3001/auth/callback";
}

export async function signInWithOAuth(provider: OAuthProvider) {
  const url = getWorkOS().userManagement.getAuthorizationUrl({
    provider,
    clientId: process.env.WORKOS_CLIENT_ID!,
    redirectUri: baseRedirectUri(),
  });
  redirect(url);
}

export async function signInWithEmail(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) return;

  const url = getWorkOS().userManagement.getAuthorizationUrl({
    provider: "authkit",
    clientId: process.env.WORKOS_CLIENT_ID!,
    redirectUri: baseRedirectUri(),
    loginHint: email,
  });
  redirect(url);
}
