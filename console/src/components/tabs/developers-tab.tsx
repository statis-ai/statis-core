"use client";

import { useEffect, useState } from "react";
import { Copy, Plus, KeyRound } from "lucide-react";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface ApiKeyResponse {
    id: string;
    tenant_id: string;
    label: string | null;
    created_at: string;
    key_preview: string;
}

export default function DevelopersTab() {
    const [keys, setKeys] = useState<ApiKeyResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [newKey, setNewKey] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const [newKeyLabel, setNewKeyLabel] = useState("");

    useEffect(() => {
        fetchKeys();
    }, []);

    async function fetchKeys() {
        try {
            setLoading(true);
            const apiKey = localStorage.getItem("statis_api_key") || process.env.NEXT_PUBLIC_API_KEY || "";
            const res = await fetch(`${BASE}/admin/api-keys`, {
                headers: { "X-API-Key": apiKey },
            });
            if (!res.ok) {
                const body = await res.text();
                throw new Error(`Failed to load keys (${res.status}): ${body}`);
            }
            const data = await res.json();
            setKeys(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    async function generateKey() {
        try {
            const apiKey = localStorage.getItem("statis_api_key") || process.env.NEXT_PUBLIC_API_KEY || "";
            const label = newKeyLabel.trim() || "New API Key";
            const res = await fetch(`${BASE}/admin/api-keys`, {
                method: "POST",
                headers: {
                    "X-API-Key": apiKey,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ label }),
            });
            if (!res.ok) {
                const body = await res.text();
                throw new Error(`Failed to generate key (${res.status}): ${body}`);
            }
            const data = await res.json();
            setNewKey(data.raw_key);
            setNewKeyLabel("");
            fetchKeys();
        } catch (err: any) {
            setError(err.message);
        }
    }

    function handleCopy() {
        if (newKey) {
            navigator.clipboard.writeText(newKey);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    }

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-xl font-semibold text-white">API Keys</h2>
                <p className="text-sm text-[#888888] mt-1">
                    Manage your API keys to authenticate with the Statis platform. Keep these secret.
                </p>
            </div>

            {newKey && (
                <div className="bg-[#111111] border border-emerald-500/30 rounded p-6">
                    <div className="flex items-center gap-3 text-emerald-400 mb-2">
                        <KeyRound className="w-5 h-5" />
                        <h3 className="font-semibold">New API Key Generated</h3>
                    </div>
                    <p className="text-sm text-[#888888] mb-4">
                        Please copy this key immediately. You will not be able to see it again.
                    </p>
                    <div className="flex items-center gap-2">
                        <code className="flex-1 bg-[#0a0a0a] border border-[#1a1a1a] px-4 py-2 text-[#d4d4d4] font-mono rounded">
                            {newKey}
                        </code>
                        <button
                            onClick={handleCopy}
                            className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-medium rounded transition-colors flex items-center gap-2"
                        >
                            <Copy className="w-4 h-4" />
                            {copied ? "Copied!" : "Copy"}
                        </button>
                    </div>
                    <button
                        onClick={() => setNewKey(null)}
                        className="mt-4 text-sm text-[#888888] hover:text-white transition-colors"
                    >
                        I have saved this key securely
                    </button>
                </div>
            )}

            <div className="bg-[#111111] border border-[#1a1a1a] rounded overflow-hidden">
                <div className="p-4 border-b border-[#1a1a1a]">
                    <div className="flex items-center gap-2 mb-3">
                        <input
                            type="text"
                            placeholder="Key label (optional)"
                            value={newKeyLabel}
                            onChange={(e) => setNewKeyLabel(e.target.value)}
                            className="flex-1 px-3 py-1.5 rounded bg-white/[0.03] border border-[#1a1a1a] text-white text-[13px] placeholder:text-[#444444] focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/10 transition-colors"
                        />
                        <button
                            onClick={generateKey}
                            className="flex items-center gap-2 px-3 py-1.5 bg-[#d4d4d4] hover:bg-white text-[#0a0a0a] text-sm font-medium rounded transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Generate New Key
                        </button>
                    </div>
                    <h3 className="font-medium text-white">Active Keys</h3>
                </div>

                {error && (
                    <div className="px-4 py-2 text-sm text-red-400 border-b border-[#1a1a1a]">{error}</div>
                )}

                {loading ? (
                    <div className="p-8 text-center text-[#888888]">Loading keys...</div>
                ) : keys.length === 0 ? (
                    <div className="p-8 text-center text-[#888888]">No API keys found.</div>
                ) : (
                    <table className="w-full text-left text-sm">
                        <thead className="bg-[#0a0a0a] text-[#444444]">
                            <tr>
                                <th className="px-4 py-3 font-medium">NAME</th>
                                <th className="px-4 py-3 font-medium">KEY PREVIEW</th>
                                <th className="px-4 py-3 font-medium">CREATED</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1a1a1a]">
                            {keys.map((k) => (
                                <tr key={k.id} className="hover:bg-white/[0.02] transition-colors">
                                    <td className="px-4 py-3 text-white font-medium">{k.label}</td>
                                    <td className="px-4 py-3 font-mono text-[#888888]">{k.key_preview}</td>
                                    <td className="px-4 py-3 text-[#888888]">
                                        {new Date(k.created_at).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
