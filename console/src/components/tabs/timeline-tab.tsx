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

  if (loading) return <p className="text-brand-muted animate-pulse">Loading events…</p>;
  if (error) return <p className="text-brand-error">{error}</p>;
  if (events.length === 0) return <p className="text-brand-muted">No events found.</p>;

  return (
    <div className="space-y-2">
      <p className="text-xs text-brand-muted">
        {events.length} event{events.length !== 1 ? "s" : ""}
      </p>
      <div className="divide-y divide-brand-border rounded border border-brand-border overflow-hidden">
        {events.map((ev) => {
          const isOpen = expanded.has(ev.event_id);
          return (
            <div key={ev.event_id} className="bg-brand-surface">
              <button
                onClick={() => toggle(ev.event_id)}
                className="w-full flex items-center gap-4 px-4 py-3 text-left text-sm
                           hover:bg-brand-statist/60 transition-colors"
              >
                <span className="text-brand-accent font-mono text-xs shrink-0">
                  {isOpen ? "▾" : "▸"}
                </span>
                <span className="font-mono text-xs text-brand-muted w-36 shrink-0 truncate">
                  {ev.event_id}
                </span>
                <span className="font-semibold text-white truncate">
                  {ev.event_type}
                </span>
                <span className="ml-auto text-xs text-brand-muted shrink-0">
                  {new Date(ev.occurred_at).toLocaleString()}
                </span>
                <span className="text-xs text-brand-muted shrink-0">
                  {ev.producer}
                </span>
              </button>
              {isOpen && (
                <div className="px-4 pb-3">
                  <pre className="rounded bg-brand-statist border border-brand-border p-3
                                  text-xs font-mono text-brand-accent overflow-auto max-h-60">
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
