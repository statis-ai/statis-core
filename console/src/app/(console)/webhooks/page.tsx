"use client";

import { useState, useEffect, useCallback } from "react";
import { Radio, Plus, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  fetchWebhooks,
  createWebhook,
  deleteWebhook,
  type WebhookRecord,
} from "@/lib/api";

const STATUS_STYLES: Record<string, string> = {
  true: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  false: "bg-white/5 text-[#444444] border-[#1a1a1a]",
};

const EVENT_OPTIONS = [
  "action.completed",
  "action.denied",
  "action.escalated",
  "receipt.minted",
];

const inputCls =
  "w-full font-mono text-sm px-3 py-2 rounded border border-[#1a1a1a] bg-[#111111] text-white placeholder:text-[#444444] focus:outline-none focus:ring-1 focus:ring-white/20";

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<WebhookRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPanel, setShowPanel] = useState(false);
  const [saving, setSaving] = useState(false);

  const [newUrl, setNewUrl] = useState("");
  const [newEvents, setNewEvents] = useState<string[]>([]);

  const load = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchWebhooks();
      setWebhooks(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load webhooks");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function openPanel() {
    setNewUrl("");
    setNewEvents([]);
    setShowPanel(true);
  }

  function toggleEvent(event: string) {
    setNewEvents((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event]
    );
  }

  async function handleCreate() {
    if (!newUrl || newEvents.length === 0) return;
    setSaving(true);
    try {
      await createWebhook({ url: newUrl, events: newEvents });
      setShowPanel(false);
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Create failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this webhook?")) return;
    try {
      await deleteWebhook(id);
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  }

  if (loading) {
    return (
      <div className="p-8 max-w-3xl">
        <p className="text-sm text-[#888888]">Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[20px] font-semibold text-white">Webhooks</h1>
          <p className="text-xs text-[#444444] mt-0.5">
            {webhooks.length} subscription{webhooks.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={openPanel}
          className="flex items-center gap-2 px-4 py-2 rounded bg-[#d4d4d4] text-[#0a0a0a] text-sm font-semibold hover:bg-white transition-colors"
        >
          <Plus size={14} />
          Add webhook
        </button>
      </div>

      {error && (
        <div className="mb-4 px-4 py-2 rounded border border-red-500/20 bg-red-500/10 text-red-400 text-xs font-mono">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-3 text-red-400/60 hover:text-red-400"
          >
            dismiss
          </button>
        </div>
      )}

      {webhooks.length === 0 ? (
        <div className="text-center py-16 text-[#444444] text-sm">
          No webhooks configured
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {webhooks.map((wh) => (
            <div
              key={wh.id}
              className="bg-[#111111] rounded border border-[#1a1a1a] p-5 hover:border-white/[0.1] transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded bg-white/[0.06] flex items-center justify-center shrink-0">
                  <Radio size={14} className="text-[#d4d4d4]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-mono text-xs text-[#888888] truncate">
                      {wh.url}
                    </p>
                    <span
                      className={cn(
                        "text-[10px] font-medium px-2 py-0.5 rounded-full border shrink-0",
                        STATUS_STYLES[String(wh.is_active)]
                      )}
                    >
                      {wh.is_active ? "active" : "inactive"}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#444444] font-mono mb-2">
                    {wh.id}
                  </p>
                  <div className="flex items-center gap-1.5 flex-wrap mb-2">
                    {wh.events.map((e) => (
                      <span
                        key={e}
                        className="font-mono text-[10px] text-[#d4d4d4]/70 bg-white/[0.06] border border-[#1a1a1a] px-2 py-0.5 rounded"
                      >
                        {e}
                      </span>
                    ))}
                  </div>
                  <p className="text-[11px] text-[#444444]">
                    Created:{" "}
                    {new Date(wh.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(wh.id)}
                  className="text-[#444444] hover:text-red-400 transition-colors shrink-0 mt-1"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add webhook panel */}
      {showPanel && (
        <div className="fixed inset-y-0 right-0 w-[400px] bg-[#111111] border-l border-[#1a1a1a] shadow-2xl z-50 flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#1a1a1a]">
            <div>
              <p className="text-sm font-semibold text-white">Add webhook</p>
              <p className="text-xs text-[#444444] mt-0.5">
                Subscribe to event notifications
              </p>
            </div>
            <button
              onClick={() => setShowPanel(false)}
              className="text-[#444444] hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          <div className="p-6 flex-1 overflow-y-auto space-y-5">
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-widest text-[#444444] block mb-2">
                Endpoint URL
              </label>
              <input
                placeholder="https://example.com/webhook"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                className={inputCls}
              />
            </div>

            <div>
              <label className="text-[10px] font-semibold uppercase tracking-widest text-[#444444] block mb-2">
                Events
              </label>
              <div className="space-y-2">
                {EVENT_OPTIONS.map((event) => (
                  <label
                    key={event}
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={newEvents.includes(event)}
                      onChange={() => toggleEvent(event)}
                      className="accent-[#d4d4d4]"
                    />
                    <span className="font-mono text-xs text-[#888888]">
                      {event}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-[#1a1a1a] flex gap-3">
            <button
              onClick={handleCreate}
              disabled={saving || !newUrl || newEvents.length === 0}
              className="flex-1 py-2 rounded bg-[#d4d4d4] text-[#0a0a0a] text-sm font-semibold hover:bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {saving ? "Creating..." : "Create webhook"}
            </button>
            <button
              onClick={() => setShowPanel(false)}
              className="px-4 py-2 rounded border border-[#1a1a1a] text-[#888888] text-sm hover:text-white hover:border-white/20 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
