"use client";

import { useEffect, useState } from "react";
import { Copy, Plus, KeyRound } from "lucide-react";

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

    useEffect(() => {
        fetchKeys();
    }, []);

    async function fetchKeys() {
        try {
            setLoading(true);
            const apiKey = localStorage.getItem("statis_api_key") || process.env.NEXT_PUBLIC_API_KEY || "";
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/admin/api-keys`, {
                headers: { "X-API-Key": apiKey },
            });
            if (!res.ok) throw new Error("Failed to fetch API keys");
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
            const label = prompt("Enter a label for this API key:") || "New API Key";
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/admin/api-keys`, {
                method: "POST",
                headers: {
                    "X-API-Key": apiKey,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ label }),
            });
            if (!res.ok) throw new Error("Failed to generate API key");
            const data = await res.json();
            setNewKey(data.raw_key);
            fetchKeys();
        } catch (err: any) {
            alert(err.message);
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
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h2 className="text-xl font-semibold text-white">API Keys</h2>
                <p className="text-sm text-brand-muted mt-1">
                    Manage your API keys to authenticate with the Statis platform. Keep these secret.
                </p>
            </div>

            {newKey && (
                <div className="bg-[#0d0d1a] border border-emerald-500/30 rounded-lg p-6 backdrop-blur-md">
                    <div className="flex items-center gap-3 text-emerald-400 mb-2">
                        <KeyRound className="w-5 h-5" />
                        <h3 className="font-semibold">New API Key Generated</h3>
                    </div>
                    <p className="text-sm text-brand-muted mb-4">
                        Please copy this key immediately. You will not be able to see it again.
                    </p>
                    <div className="flex items-center gap-2">
                        <code className="flex-1 bg-[#080810] border border-brand-border px-4 py-2 text-[#00ffc8] font-mono rounded">
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
                        className="mt-4 text-sm text-brand-muted hover:text-white transition-colors"
                    >
                        I have saved this key securely
                    </button>
                </div>
            )}

            <div className="bg-[#0d0d1a] border border-brand-border rounded-lg overflow-hidden backdrop-blur-md">
                <div className="p-4 border-b border-brand-border flex items-center justify-between">
                    <h3 className="font-medium text-white">Active Keys</h3>
                    <button
                        onClick={generateKey}
                        className="flex items-center gap-2 px-3 py-1.5 bg-[#00ffc8] hover:bg-[#00ffc8]/90 text-[#080810] text-sm font-medium rounded transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Generate New Key
                    </button>
                </div>

                {loading ? (
                    <div className="p-8 text-center text-brand-muted">Loading keys...</div>
                ) : error ? (
                    <div className="p-8 text-center text-red-400">{error}</div>
                ) : keys.length === 0 ? (
                    <div className="p-8 text-center text-brand-muted">No API keys found.</div>
                ) : (
                    <table className="w-full text-left text-sm">
                        <thead className="bg-[#0a0a14] text-brand-muted">
                            <tr>
                                <th className="px-4 py-3 font-medium">NAME</th>
                                <th className="px-4 py-3 font-medium">KEY PREVIEW</th>
                                <th className="px-4 py-3 font-medium">CREATED</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-border">
                            {keys.map((k) => (
                                <tr key={k.id} className="hover:bg-white/[0.02] transition-colors">
                                    <td className="px-4 py-3 text-white font-medium">{k.label}</td>
                                    <td className="px-4 py-3 font-mono text-brand-muted">{k.key_preview}</td>
                                    <td className="px-4 py-3 text-brand-muted">
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
