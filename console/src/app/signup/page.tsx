"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Hexagon, ArrowRight } from "lucide-react";

export default function SignupPage() {
    const [email, setEmail] = useState("");
    const [projectName, setProjectName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const router = useRouter();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            const res = await fetch(`${apiUrl}/admin/signup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, project_name: projectName }),
            });

            if (!res.ok) {
                const text = await res.text();
                let message = text;
                try {
                    const json = JSON.parse(text);
                    message = json.detail ?? (typeof json.detail === "object" ? JSON.stringify(json.detail) : text);
                } catch {
                    if (!text || res.status === 0)
                        message = "Cannot reach API (network or CORS). Set Railway API FRONTEND_URL to this site’s origin (e.g. " + (typeof window !== "undefined" ? window.location.origin : "https://your-console.vercel.app") + ") and redeploy the API.";
                    else if (!text)
                        message = `HTTP ${res.status}`;
                }
                throw new Error(`Signup failed (${res.status}): ${message}`);
            }

            const data = await res.json();

            // Store API Key in localStorage to simulate an auth session
            localStorage.setItem("statis_api_key", data.api_key);
            localStorage.setItem("statis_tenant_id", data.tenant_id);

            // Redirect to the main console page
            router.push("/");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.1),rgba(0,0,0,1)_100%)] pointer-events-none" />

            <div className="w-full max-w-md bg-brand-surface/50 border border-brand-border backdrop-blur-xl rounded-2xl p-8 shadow-2xl z-10 animate-in slide-in-from-bottom-4 duration-500">
                <div className="flex flex-col items-center mb-8">
                    <div className="h-12 w-12 bg-black border border-brand-border rounded-xl flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                        <Hexagon className="w-6 h-6 text-brand-accent fill-brand-accent/20" />
                    </div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Create your workspace</h1>
                    <p className="text-brand-muted text-sm mt-2 text-center">
                        Sign up to get your Master API Key and start tracking reliable entity states.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg text-center">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-brand-muted mb-1.5" htmlFor="email">
                            Work Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-black/40 border border-brand-border rounded-lg px-4 py-2.5 text-white placeholder:text-brand-muted/50 focus:outline-none focus:border-brand-accent transition-colors"
                            placeholder="you@company.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-brand-muted mb-1.5" htmlFor="projectName">
                            Project Name
                        </label>
                        <input
                            id="projectName"
                            type="text"
                            required
                            value={projectName}
                            onChange={(e) => setProjectName(e.target.value)}
                            className="w-full bg-black/40 border border-brand-border rounded-lg px-4 py-2.5 text-white placeholder:text-brand-muted/50 focus:outline-none focus:border-brand-accent transition-colors"
                            placeholder="e.g., Core API"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-brand-accent hover:bg-emerald-500 text-white font-medium rounded-lg px-4 py-2.5 mt-2 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                    >
                        {loading ? "Creating..." : "Continue"}
                        {!loading && <ArrowRight className="w-4 h-4" />}
                    </button>
                </form>
            </div>
        </div>
    );
}
