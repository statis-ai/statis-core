"use client";

import { useState } from "react";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "submitting" | "success">("idle");

  return (
    <form
      className="flex gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (!email) return;
        setState("submitting");
        // Placeholder — wire to real endpoint later
        setTimeout(() => setState("success"), 400);
      }}
    >
      <input
        type="email"
        placeholder="you@company.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={state !== "idle"}
        className="flex-1 text-[12px] px-3 py-2 rounded-md outline-none transition-colors focus:border-white/20"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.10)",
          color: "#E4E4E7",
        }}
      />
      <button
        type="submit"
        disabled={state !== "idle"}
        className="text-[12px] font-semibold px-4 py-2 rounded-md transition-colors hover:bg-[rgba(249,115,22,0.15)] disabled:opacity-60"
        style={{
          background: "rgba(249,115,22,0.10)",
          border: "1px solid #F97316",
          color: "#F97316",
        }}
      >
        {state === "success" ? "Subscribed" : state === "submitting" ? "..." : "Subscribe"}
      </button>
    </form>
  );
}
