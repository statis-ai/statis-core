"use client";

import { useEffect, useState } from "react";

const SANDBOX_API_KEY = "sk_sandbox_demo_key_statis_2025";

export function SandboxBanner() {
  const [isSandbox, setIsSandbox] = useState(false);

  useEffect(() => {
    const key = localStorage.getItem("statis_api_key");
    setIsSandbox(key === SANDBOX_API_KEY);
  }, []);

  if (!isSandbox) return null;

  return (
    <div className="w-full bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 flex items-center justify-between text-xs">
      <span className="text-amber-400 font-medium">
        Sandbox Mode — data resets every 24h. Actions are observe-only.
      </span>
      <a
        href="https://statis.dev"
        target="_blank"
        rel="noopener noreferrer"
        className="text-amber-400 underline hover:text-amber-300"
      >
        Get your API key
      </a>
    </div>
  );
}
