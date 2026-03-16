"use client";

export default function SettingsPage() {
  return (
    <div className="p-8 max-w-xl">
      <div className="mb-8">
        <h1 className="text-[20px] font-semibold text-gray-900">Settings</h1>
        <p className="text-xs text-gray-400 mt-0.5">Workspace configuration</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
        <div className="p-5">
          <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 block mb-2">Tenant ID</label>
          <input
            defaultValue="tenant-statis-demo"
            className="w-full font-mono text-sm px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="p-5">
          <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 block mb-2">API Key</label>
          <input
            defaultValue="sk_demo_xxxxxxxxxxxxxxxx"
            type="password"
            className="w-full font-mono text-sm px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="p-5">
          <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 block mb-2">API URL</label>
          <input
            defaultValue="https://api.statis.dev"
            className="w-full font-mono text-sm px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="mt-5 flex gap-3">
        <button className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors">
          Save settings
        </button>
      </div>
    </div>
  );
}
