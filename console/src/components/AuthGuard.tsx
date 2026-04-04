"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const apiKey = localStorage.getItem("statis_api_key");
    if (!apiKey) {
      router.replace("/auth");
    }
  }, [router]);

  return <>{children}</>;
}
