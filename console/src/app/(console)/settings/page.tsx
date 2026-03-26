"use client";

export default function SettingsPage() {
  return (
    <div className="p-8 max-w-xl">
      <div className="mb-8">
        <h1 className="text-[20px] font-semibold text-white">Settings</h1>
        <p className="text-xs text-[#5a5a7a] mt-0.5">Workspace configuration</p>
      </div>

      <div className="bg-[#0d0d1a] rounded-xl border border-white/8 divide-y divide-white/5">
        <div className="p-5">
          <label className="text-[10px] font-semibold uppercase tracking-widest text-[#5a5a7a] block mb-2">Tenant ID</label>
          <input
            defaultValue="tenant-statis-demo"
            className="w-full font-mono text-sm px-3 py-2 rounded-lg border border-white/8 bg-[#0a0a14] text-white placeholder:text-[#4a4a6a] focus:outline-none focus:ring-1 focus:ring-[#00ffc8]/40"
          />
        </div>
        <div className="p-5">
          <label className="text-[10px] font-semibold uppercase tracking-widest text-[#5a5a7a] block mb-2">API Key</label>
          <input
            defaultValue="sk_demo_xxxxxxxxxxxxxxxx"
            type="password"
            className="w-full font-mono text-sm px-3 py-2 rounded-lg border border-white/8 bg-[#0a0a14] text-white placeholder:text-[#4a4a6a] focus:outline-none focus:ring-1 focus:ring-[#00ffc8]/40"
          />
        </div>
        <div className="p-5">
          <label className="text-[10px] font-semibold uppercase tracking-widest text-[#5a5a7a] block mb-2">API URL</label>
          <input
            defaultValue="https://api.statis.dev"
            className="w-full font-mono text-sm px-3 py-2 rounded-lg border border-white/8 bg-[#0a0a14] text-white placeholder:text-[#4a4a6a] focus:outline-none focus:ring-1 focus:ring-[#00ffc8]/40"
          />
        </div>
      </div>

      <div className="mt-5 flex gap-3">
        <button className="px-4 py-2 rounded-lg bg-[#00ffc8] text-[#080810] text-sm font-semibold hover:bg-[#00ffc8]/90 transition-colors">
          Save settings
        </button>
      </div>
    </div>
  );
}
