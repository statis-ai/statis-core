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
        <p className="text-xs text-[#5a5a7a] mt-0.5">Workspace configuration</p>
      </div>

      <div className="bg-[#0d0d1a] rounded-xl border border-white/8 divide-y divide-white/5">
        <div className="p-5">
          <label className="text-[10px] font-semibold uppercase tracking-widest text-[#5a5a7a] block mb-2">
            Tenant ID
          </label>
          <input
            value={tenantId}
            onChange={(e) => setTenantId(e.target.value)}
            className="w-full font-mono text-sm px-3 py-2 rounded-lg border border-white/8 bg-[#0a0a14] text-white placeholder:text-[#4a4a6a] focus:outline-none focus:ring-1 focus:ring-[#00ffc8]/40"
          />
        </div>

        <div className="p-5">
          <label className="text-[10px] font-semibold uppercase tracking-widest text-[#5a5a7a] block mb-2">
            API Key
          </label>
          <div className="flex gap-2">
            <input
              value={revealed ? apiKey : apiKey ? "•".repeat(Math.min(apiKey.length, 32)) : ""}
              onChange={(e) => revealed && setApiKey(e.target.value)}
              readOnly={!revealed}
              className="flex-1 font-mono text-sm px-3 py-2 rounded-lg border border-white/8 bg-[#0a0a14] text-white placeholder:text-[#4a4a6a] focus:outline-none focus:ring-1 focus:ring-[#00ffc8]/40"
            />
            <button
              onClick={() => setRevealed((r) => !r)}
              className="px-3 py-2 rounded-lg border border-white/8 bg-[#0a0a14] text-[#5a5a7a] hover:text-white transition-colors"
              title={revealed ? "Hide" : "Reveal"}
            >
              {revealed ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
            <button
              onClick={handleCopy}
              className="px-3 py-2 rounded-lg border border-white/8 bg-[#0a0a14] text-[#5a5a7a] hover:text-white transition-colors"
              title="Copy API key"
            >
              {copied ? <Check size={14} className="text-[#00ffc8]" /> : <Copy size={14} />}
            </button>
          </div>
          {copied && (
            <p className="text-[11px] text-[#00ffc8] mt-1.5">Copied</p>
          )}
        </div>

        <div className="p-5">
          <label className="text-[10px] font-semibold uppercase tracking-widest text-[#5a5a7a] block mb-2">
            Email
          </label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            className="w-full font-mono text-sm px-3 py-2 rounded-lg border border-white/8 bg-[#0a0a14] text-white placeholder:text-[#4a4a6a] focus:outline-none focus:ring-1 focus:ring-[#00ffc8]/40"
          />
        </div>

        <div className="p-5">
          <label className="text-[10px] font-semibold uppercase tracking-widest text-[#5a5a7a] block mb-2">
            API URL
          </label>
          <input
            value="https://api.statis.dev"
            readOnly
            className="w-full font-mono text-sm px-3 py-2 rounded-lg border border-white/8 bg-[#0a0a14] text-[#5a5a7a] focus:outline-none cursor-default"
          />
        </div>
      </div>

      <div className="mt-5 flex gap-3">
        <button
          onClick={handleSave}
          className="px-4 py-2 rounded-lg bg-[#00ffc8] text-[#080810] text-sm font-semibold hover:bg-[#00ffc8]/90 transition-colors"
        >
          Save settings
        </button>
      </div>
    </div>
  );
}
