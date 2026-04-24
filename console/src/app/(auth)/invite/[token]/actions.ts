"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const INVITE_COOKIE = "statis_invite";

export async function acceptInvite(formData: FormData) {
  const token = String(formData.get("token") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const orgName = String(formData.get("orgName") ?? "").trim();

  if (!token) return;

  const store = await cookies();
  store.set(
    INVITE_COOKIE,
    JSON.stringify({ token, email, orgName, createdAt: Date.now() }),
    { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 },
  );

  const params = new URLSearchParams();
  if (email) params.set("email", email);
  params.set("invite", token);
  redirect(`/signup?${params.toString()}`);
}
