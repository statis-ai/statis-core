"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { fetchAllEvents, type EventRecord } from "@/lib/api";

const TYPE_STYLES: Record<string, string> = {
  "receipt.minted": "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  "action.completed": "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  "adapter.ok": "bg-sky-500/15 text-sky-400 border-sky-500/20",
  "state.updated": "bg-sky-500/15 text-sky-400 border-sky-500/20",
  "policy.approved": "bg-white/[0.06] text-[#d4d4d4] border-white/[0.1]",
  "policy.denied": "bg-red-500/15 text-red-400 border-red-500/20",
  "action.denied": "bg-red-500/15 text-red-400 border-red-500/20",
  "action.received": "bg-white/5 text-[#444444] border-[#1a1a1a]",
  "action.escalated": "bg-orange-500/15 text-orange-400 border-orange-500/20",
};

function formatTimeHMS(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

function payloadPreview(payload: Record<string, unknown>): string {
  const str = JSON.stringify(payload);
  if (str.length <= 80) return str;
  return str.slice(0, 77) + "...";
}

export default function EventsPage() {
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>("All");

  const load = () => {
    fetchAllEvents({ limit: 100 })
      .then((data) => {
        setEvents(data);
        setError(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, []);

  const eventTypes = ["All", ...Array.from(new Set(events.map((e) => e.event_type)))];

  const filtered =
    typeFilter === "All"
      ? events
      : events.filter((e) => e.event_type === typeFilter);

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-[20px] font-semibold text-white">Events</h1>
        <p className="text-xs text-[#444444] mt-0.5">Raw event log</p>
      </div>

      {/* Type filter pills */}
      {!loading && events.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-5">
          {eventTypes.map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={cn(
                "px-3 py-1.5 rounded text-xs font-medium transition-colors",
                typeFilter === t
                  ? "bg-white/[0.08] text-[#d4d4d4] border border-white/[0.12]"
                  : "bg-transparent border border-[#1a1a1a] text-[#444444] hover:text-white hover:border-white/20"
              )}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <p className="text-[#888888] text-sm">Loading...</p>
      ) : error ? (
        <p className="text-red-400 text-sm">{error}</p>
      ) : filtered.length === 0 ? (
        <p className="text-[#444444] text-sm">No data</p>
      ) : (
        <div className="bg-[#111111] rounded border border-[#1a1a1a] overflow-hidden">
          <div className="bg-[#0a0a0a] border-b border-[#1a1a1a] px-5 py-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-[#444444] font-mono">Live</span>
            <span className="text-xs text-[#444444] ml-auto">{filtered.length} events</span>
          </div>
          <div className="divide-y divide-[#1a1a1a]">
            {filtered.map((ev, i) => (
              <div key={ev.event_id ?? i}>
                <div
                  className="flex items-start gap-4 px-5 py-3 hover:bg-white/[0.02] transition-colors cursor-pointer"
                  onClick={() => setExpandedIdx(expandedIdx === i ? null : i)}
                >
                  <span className="font-mono text-[11px] text-[#444444] shrink-0 mt-0.5 w-20">
                    {formatTimeHMS(ev.occurred_at)}
                  </span>
                  <span
                    className={cn(
                      "text-[10px] font-medium px-2 py-0.5 rounded border shrink-0 self-start mt-0.5",
                      TYPE_STYLES[ev.event_type] ?? "bg-white/5 text-[#444444] border-[#1a1a1a]"
                    )}
                  >
                    {ev.event_type}
                  </span>
                  <span className="font-mono text-[11px] text-[#d4d4d4]/70 shrink-0 mt-0.5">
                    {ev.entity_type}/{ev.entity_id}
                  </span>
                  <span className="font-mono text-[11px] text-[#444444] shrink-0 mt-0.5">
                    {ev.producer}
                  </span>
                  <span className="text-xs text-[#888888] mt-0.5 truncate">
                    {payloadPreview(ev.payload)}
                  </span>
                </div>
                {expandedIdx === i && (
                  <div className="px-5 pb-4 border-t border-[#1a1a1a] bg-[#0a0a0a]">
                    <div className="pt-3">
                      <p className="text-[10px] uppercase tracking-widest text-[#444444] mb-1">
                        Full Payload
                      </p>
                      <pre className="text-xs text-[#888888] whitespace-pre-wrap break-all">
                        {JSON.stringify(ev.payload, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
