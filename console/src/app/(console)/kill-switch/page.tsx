"use client";

import { useEffect, useState, useCallback } from "react";
import { ShieldOff, ShieldCheck, AlertTriangle } from "lucide-react";
import {
  fetchKillSwitchStatus,
  activateKillSwitch,
  deactivateKillSwitch,
} from "@/lib/api";
import type { KillSwitchStatus } from "@/lib/api";

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export default function KillSwitchPage() {
  const [status, setStatus] = useState<KillSwitchStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStatus = useCallback(async () => {
    try {
      const s = await fetchKillSwitchStatus();
      setStatus(s);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load status");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStatus();
    const interval = setInterval(loadStatus, 10_000);
    return () => clearInterval(interval);
  }, [loadStatus]);

  async function handleActivate() {
    setConfirmOpen(false);
    setActing(true);
    setError(null);
    try {
      const s = await activateKillSwitch();
      setStatus(s);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to activate");
    } finally {
      setActing(false);
    }
  }

  async function handleDeactivate() {
    setActing(true);
    setError(null);
    try {
      const s = await deactivateKillSwitch();
      setStatus(s);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to deactivate");
    } finally {
      setActing(false);
    }
  }

  const isActive = status?.active ?? false;

  return (
    <div className="p-8 max-w-2xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-[#d4d4d4] mb-1">Kill Switch</h1>
        <p className="text-sm text-[#444444]">
          When active, all action evaluations are immediately denied regardless of policy.
          Use this to halt agent execution across your entire tenant.
        </p>
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 rounded border border-red-500/30 bg-red-500/10 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Status card */}
      <div className="rounded-lg border border-[#1a1a1a] bg-[#0f0f0f] p-6 mb-6">
        {loading ? (
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#1a1a1a] animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 w-24 bg-[#1a1a1a] rounded animate-pulse" />
              <div className="h-3 w-36 bg-[#1a1a1a] rounded animate-pulse" />
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-4">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                isActive
                  ? "bg-red-500/20 border border-red-500/40"
                  : "bg-[#1a1a1a] border border-[#222]"
              }`}
            >
              {isActive ? (
                <ShieldOff size={20} className="text-red-400" />
              ) : (
                <ShieldCheck size={20} className="text-[#444444]" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <span
                  className={`text-lg font-semibold ${
                    isActive ? "text-red-400" : "text-[#888888]"
                  }`}
                >
                  {isActive ? "ACTIVE" : "INACTIVE"}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide ${
                    isActive
                      ? "bg-red-500/20 text-red-400 border border-red-500/30"
                      : "bg-[#1a1a1a] text-[#444444] border border-[#222]"
                  }`}
                >
                  {isActive ? "ALL ACTIONS DENIED" : "NORMAL OPERATION"}
                </span>
              </div>

              {isActive && status?.activated_at && (
                <p className="text-xs text-[#444444]">
                  Activated {formatDateTime(status.activated_at)}
                  {status.activated_by && (
                    <span className="ml-2 font-mono text-[#555555]">
                      by {status.activated_by}
                    </span>
                  )}
                </p>
              )}

              {!isActive && (
                <p className="text-xs text-[#444444]">
                  Policy engine running normally. All actions are evaluated against policy rules.
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Action button */}
      {!loading && (
        <div>
          {isActive ? (
            <button
              onClick={handleDeactivate}
              disabled={acting}
              className="px-4 py-2 rounded bg-[#1a1a1a] border border-[#222] text-[#888888] text-sm font-medium hover:bg-[#222] hover:text-[#d4d4d4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {acting ? "Deactivating…" : "Deactivate Kill Switch"}
            </button>
          ) : (
            <button
              onClick={() => setConfirmOpen(true)}
              disabled={acting}
              className="px-4 py-2 rounded bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {acting ? "Activating…" : "Activate Kill Switch"}
            </button>
          )}
        </div>
      )}

      {/* Confirmation modal */}
      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg p-6 max-w-sm w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle size={20} className="text-red-400 shrink-0" />
              <h2 className="text-[#d4d4d4] font-semibold">Activate Kill Switch?</h2>
            </div>
            <p className="text-sm text-[#888888] mb-6">
              This will immediately deny <strong className="text-[#d4d4d4]">all</strong> action
              evaluations for this tenant until you deactivate it. Agent workflows will be blocked.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmOpen(false)}
                className="px-4 py-2 rounded border border-[#222] text-[#888888] text-sm hover:text-[#d4d4d4] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleActivate}
                className="px-4 py-2 rounded bg-red-500/20 border border-red-500/40 text-red-400 text-sm font-medium hover:bg-red-500/30 transition-colors"
              >
                Yes, Activate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
