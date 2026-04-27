"use client";

/**
 * ArgsPanel — D19
 *
 * Renders an action's parameters dict with content-aware variants:
 *
 *   long-string  → max-h 240 + word-wrap, "show all" toggle
 *   nested       → 2-level inline expand, then "+N more"
 *   binary       → `<binary 4.2MB · sha256=…>` (italic, --text-subtle)
 *   no-args      → italic --text-subtle "no parameters"
 *   primitive    → flat row
 *
 * D8 PII shape extraction: this v1 renders raw values. The real
 * shape-extractor + entropy heuristic + custom-type fallback lives
 * server-side at the API boundary in a follow-up. For now we trust the
 * server already redacted high-confidence PII and we render whatever
 * shape it sends.
 */
import * as React from "react";


export interface ArgsPanelProps {
  parameters: Record<string, unknown>;
}

const LONG_STRING_THRESHOLD = 280;
const MAX_NESTED_KEYS_INLINE = 2;


export function ArgsPanel({ parameters }: ArgsPanelProps): React.ReactElement {
  const entries = Object.entries(parameters || {});
  if (entries.length === 0) {
    return (
      <div className="args-panel" data-testid="args-panel">
        <div className="args-panel__row">
          <div className="args-panel__key">parameters</div>
          <div className="args-panel__value args-panel__value--empty">
            no parameters
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="args-panel" data-testid="args-panel">
      {entries.map(([key, value]) => (
        <ArgRow key={key} argKey={key} value={value} />
      ))}
    </div>
  );
}


function ArgRow({
  argKey,
  value,
}: {
  argKey: string;
  value: unknown;
}): React.ReactElement {
  return (
    <div className="args-panel__row">
      <div className="args-panel__key">{argKey}</div>
      <div className="args-panel__value">
        <ArgValue value={value} />
      </div>
    </div>
  );
}


function ArgValue({ value }: { value: unknown }): React.ReactElement {
  if (value === null || value === undefined) {
    return <span className="args-panel__value--empty">null</span>;
  }
  if (typeof value === "boolean" || typeof value === "number") {
    return <>{String(value)}</>;
  }
  if (typeof value === "string") {
    if (looksBinary(value)) {
      return (
        <span className="args-panel__value--binary">{value}</span>
      );
    }
    if (value.length > LONG_STRING_THRESHOLD) {
      return <ExpandableString value={value} />;
    }
    return <>{value}</>;
  }
  if (Array.isArray(value)) {
    return <>{`[${value.length} items]`}</>;
  }
  if (typeof value === "object") {
    return <NestedObject obj={value as Record<string, unknown>} />;
  }
  return <>{String(value)}</>;
}


function ExpandableString({ value }: { value: string }): React.ReactElement {
  const [expanded, setExpanded] = React.useState(false);
  return (
    <>
      <div
        className={`args-panel__value--long${expanded ? " is-expanded" : ""}`}
      >
        {value}
      </div>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="args-panel__expand-btn"
        data-testid="args-expand"
      >
        {expanded ? "show less" : "show all"}
      </button>
    </>
  );
}


function NestedObject({
  obj,
}: {
  obj: Record<string, unknown>;
}): React.ReactElement {
  const keys = Object.keys(obj);
  const visible = keys.slice(0, MAX_NESTED_KEYS_INLINE);
  const hiddenCount = keys.length - visible.length;
  return (
    <span>
      {"{"}
      {visible.map((k, i) => (
        <span key={k}>
          {i > 0 ? ", " : " "}
          <span className="args-panel__key">{k}</span>
          {": "}
          <ArgValue value={obj[k]} />
        </span>
      ))}
      {hiddenCount > 0 ? `, +${hiddenCount} more ` : " "}
      {"}"}
    </span>
  );
}


function looksBinary(s: string): boolean {
  // Heuristic: server-rendered placeholder of the form `<binary ... sha256=...>`.
  return s.startsWith("<binary ") && s.endsWith(">");
}
