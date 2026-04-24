"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const ORG_DRAFT_COOKIE = "statis_org_draft";

export async function createOrg(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const role = String(formData.get("role") ?? "").trim();
  const mode = String(formData.get("mode") ?? "create");

  if (!name) return;

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const store = await cookies();
  store.set(
    ORG_DRAFT_COOKIE,
    JSON.stringify({ name, slug, role, mode, createdAt: Date.now() }),
    { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 },
  );

  redirect("/onboarding");
}

export async function joinOrg(formData: FormData) {
  const code = String(formData.get("code") ?? "").trim();
  if (!code) return;

  const store = await cookies();
  store.set(
    ORG_DRAFT_COOKIE,
    JSON.stringify({ mode: "join", inviteCode: code, createdAt: Date.now() }),
    { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 },
  );

  redirect("/onboarding");
}
