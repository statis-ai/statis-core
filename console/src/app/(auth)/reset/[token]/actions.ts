"use server";

import { redirect } from "next/navigation";
import { getWorkOS } from "@workos-inc/authkit-nextjs";

export async function resetPassword(formData: FormData) {
  const token = String(formData.get("token") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (!token || !password) {
    redirect(`/reset/${token || "invalid"}?error=missing`);
  }
  if (password.length < 12) {
    redirect(`/reset/${token}?error=short`);
  }
  if (password !== confirm) {
    redirect(`/reset/${token}?error=mismatch`);
  }

  try {
    await getWorkOS().userManagement.resetPassword({ token, newPassword: password });
  } catch {
    redirect(`/reset/${token}?error=invalid`);
  }

  redirect("/login?reset=ok");
}
