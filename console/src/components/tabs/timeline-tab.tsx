"use client";

import { useEffect, useState } from "react";
import type { EventRecord } from "@/lib/api";
import { fetchEvents } from "@/lib/api";

interface Props {
  entityType: string;
  entityId: string;
}

export default function TimelineTab({ entityType, entityId }: Props) {
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchEvents(entityType, entityId)
      .then(setEvents)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [entityType, entityId]);

  function toggle(eventId: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(eventId)) next.delete(eventId);
      else next.add(eventId);
      return next;
    });
  }

  if (loading) return <p className="text-[#888888] animate-pulse">Loading events...</p>;
  if (error) return <p className="text-red-400">{error}</p>;
  if (events.length === 0) return <p className="text-[#888888]">No events found.</p>;

  return (
    <div className="space-y-2">
      <p className="text-xs text-[#888888]">{events.length} event{events.length !== 1 ? "s" : ""}</p>
      <div className="divide-y divide-[#1a1a1a] rounded border border-[#1a1a1a] overflow-hidden">
        {events.map((ev) => {
          const isOpen = expanded.has(ev.event_id);
          return (
            <div key={ev.event_id} className="bg-[#0a0a0a]">
              <button
                onClick={() => toggle(ev.event_id)}
                className="w-full flex items-center gap-4 px-4 py-3 text-left text-sm hover:bg-white/[0.03] transition-colors"
              >
                <span className="text-[#d4d4d4] font-mono text-xs shrink-0">{isOpen ? "▾" : "▸"}</span>
                <span className="font-mono text-xs text-[#888888] w-36 shrink-0 truncate">{ev.event_id}</span>
                <span className="font-semibold text-white truncate">{ev.event_type}</span>
                <span className="ml-auto text-xs text-[#888888] shrink-0">{new Date(ev.occurred_at).toLocaleString()}</span>
                <span className="text-xs text-[#888888] shrink-0">{ev.producer}</span>
              </button>
              {isOpen && (
                <div className="px-4 pb-3">
                  <pre className="rounded bg-[#0a0a0a] border border-[#1a1a1a] p-3 text-xs font-mono text-[#d4d4d4] overflow-auto max-h-60">
                    {JSON.stringify(ev.payload, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
