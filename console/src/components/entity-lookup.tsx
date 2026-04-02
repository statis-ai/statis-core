"use client";

import { useState } from "react";

interface Props {
  onInspect: (entityType: string, entityId: string) => void;
  loading?: boolean;
}

const ENTITY_TYPES = ["account", "user", "order", "ticket", "subscription"];

export default function EntityLookup({ onInspect, loading }: Props) {
  const [entityType, setEntityType] = useState("account");
  const [entityId, setEntityId] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = entityId.trim();
    if (trimmed) onInspect(entityType, trimmed);
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-3">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-[#888888] uppercase tracking-wider">
          Entity Type
        </label>
        <select
          value={entityType}
          onChange={(e) => setEntityType(e.target.value)}
          className="h-10 rounded border border-[#1a1a1a] bg-[#111111] px-3 text-sm
                     text-white outline-none focus:border-white/20 focus:ring-1
                     focus:ring-white/10 transition-colors"
        >
          {ENTITY_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5 flex-1">
        <label className="text-xs font-medium text-[#888888] uppercase tracking-wider">
          Entity ID
        </label>
        <input
          type="text"
          value={entityId}
          onChange={(e) => setEntityId(e.target.value)}
          placeholder="e.g. acct-001"
          className="h-10 rounded border border-[#1a1a1a] bg-[#111111] px-3 text-sm
                     text-white placeholder:text-[#444444] outline-none
                     focus:border-white/20 focus:ring-1 focus:ring-white/10
                     transition-colors"
        />
      </div>

      <button
        type="submit"
        disabled={!entityId.trim() || loading}
        className="h-10 px-5 rounded bg-[#d4d4d4] text-[#0a0a0a] text-sm font-semibold
                   hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed
                   transition-colors"
      >
        {loading ? "Loading..." : "Inspect"}
      </button>
    </form>
  );
}
