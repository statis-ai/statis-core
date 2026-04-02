"use client";

import { useState, useEffect } from "react";
import { Eye, EyeOff, Copy, Check } from "lucide-react";

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState("");
  const [email, setEmail] = useState("");
  const [tenantId, setTenantId] = useState("tenant-statis-demo");
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const storedKey = localStorage.getItem("statis_api_key");
    const storedEmail = localStorage.getItem("statis_user_email");
    if (storedKey) setApiKey(storedKey);
    if (storedEmail) setEmail(storedEmail);
  }, []);

  function handleCopy() {
    if (!apiKey) return;
    navigator.clipboard.writeText(apiKey).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleSave() {
    localStorage.setItem("statis_api_key", apiKey);
    localStorage.setItem("statis_user_email", email);
  }

  return (
    <div className="p-8 max-w-xl">
      <div className="mb-8">
        <h1 className="text-[20px] font-semibold text-white">Settings</h1>
        <p className="text-xs text-[#444444] mt-0.5">Workspace configuration</p>
      </div>

      <div className="bg-[#111111] rounded border border-[#1a1a1a] divide-y divide-[#1a1a1a]">
        <div className="p-5">
          <label className="text-[10px] font-semibold uppercase tracking-widest text-[#444444] block mb-2">
            Tenant ID
          </label>
          <input
            value={tenantId}
            onChange={(e) => setTenantId(e.target.value)}
            className="w-full font-mono text-sm px-3 py-2 rounded border border-[#1a1a1a] bg-[#0a0a0a] text-white placeholder:text-[#444444] focus:outline-none focus:ring-1 focus:ring-white/20"
          />
        </div>

        <div className="p-5">
          <label className="text-[10px] font-semibold uppercase tracking-widest text-[#444444] block mb-2">
            API Key
          </label>
          <div className="flex gap-2">
            <input
              value={revealed ? apiKey : apiKey ? "\u2022".repeat(Math.min(apiKey.length, 32)) : ""}
              onChange={(e) => revealed && setApiKey(e.target.value)}
              readOnly={!revealed}
              className="flex-1 font-mono text-sm px-3 py-2 rounded border border-[#1a1a1a] bg-[#0a0a0a] text-white placeholder:text-[#444444] focus:outline-none focus:ring-1 focus:ring-white/20"
            />
            <button
              onClick={() => setRevealed((r) => !r)}
              className="px-3 py-2 rounded border border-[#1a1a1a] bg-[#0a0a0a] text-[#444444] hover:text-white transition-colors"
              title={revealed ? "Hide" : "Reveal"}
            >
              {revealed ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
            <button
              onClick={handleCopy}
              className="px-3 py-2 rounded border border-[#1a1a1a] bg-[#0a0a0a] text-[#444444] hover:text-white transition-colors"
              title="Copy API key"
            >
              {copied ? <Check size={14} className="text-[#d4d4d4]" /> : <Copy size={14} />}
            </button>
          </div>
          {copied && (
            <p className="text-[11px] text-[#d4d4d4] mt-1.5">Copied</p>
          )}
        </div>

        <div className="p-5">
          <label className="text-[10px] font-semibold uppercase tracking-widest text-[#444444] block mb-2">
            Email
          </label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            className="w-full font-mono text-sm px-3 py-2 rounded border border-[#1a1a1a] bg-[#0a0a0a] text-white placeholder:text-[#444444] focus:outline-none focus:ring-1 focus:ring-white/20"
          />
        </div>

        <div className="p-5">
          <label className="text-[10px] font-semibold uppercase tracking-widest text-[#444444] block mb-2">
            API URL
          </label>
          <input
            value="https://api.statis.dev"
            readOnly
            className="w-full font-mono text-sm px-3 py-2 rounded border border-[#1a1a1a] bg-[#0a0a0a] text-[#444444] focus:outline-none cursor-default"
          />
        </div>
      </div>

      <div className="mt-5 flex gap-3">
        <button
          onClick={handleSave}
          className="px-4 py-2 rounded bg-[#d4d4d4] text-[#0a0a0a] text-sm font-semibold hover:bg-white transition-colors"
        >
          Save settings
        </button>
      </div>
    </div>
  );
}
