"use server";

import { redirect } from "next/navigation";
import { getWorkOS } from "@workos-inc/authkit-nextjs";

export async function requestPasswordReset(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email) return;

  try {
    await getWorkOS().userManagement.createPasswordReset({ email });
  } catch {
    /* swallow — we always land on the confirmation page so the response
       doesn't reveal whether the account exists. */
  }

  redirect(`/forgot/sent?email=${encodeURIComponent(email)}`);
}
