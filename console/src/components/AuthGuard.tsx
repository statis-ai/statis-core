"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const apiKey = localStorage.getItem("statis_api_key");
    if (!apiKey) {
      router.replace("/auth");
      return;
    }
    // If onboarding not complete, redirect there (unless already in onboarding)
    const onboarded = localStorage.getItem("statis_onboarding_complete");
    if (!onboarded && !pathname.startsWith("/onboarding")) {
      router.replace("/onboarding/industry");
    }
  }, [pathname, router]);

  return <>{children}</>;
}
