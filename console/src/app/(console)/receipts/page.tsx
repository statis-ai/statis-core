"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Receipt,
  RefreshCw,
  Check,
  X,
  Copy,
  ShieldCheck,
  ShieldAlert,
  Hash,
  CircleAlert,
} from "lucide-react";
import {
  fetchAllActions,
  fetchReceipt,
  verifyReceipt,
  type ActionContract,
  type ReceiptDetail,
  type ReceiptVerifyResult,
} from "@/lib/api";
import { PageHeader } from "@/components/observe/PageHeader";
import { LiveBadge } from "@/components/observe/LiveBadge";
import { StatTile, StatTileGrid } from "@/components/observe/StatTile";
import { StatusPill } from "@/components/observe/StatusPill";
import {
  DataTableShell,
  DataTableEmpty,
} from "@/components/observe/DataTableShell";

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function formatAbsolute(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ReceiptsPage() {
  const [actions, setActions] = useState<ActionContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [receipts, setReceipts] = useState<Record<string, ReceiptDetail>>({});
  const [receiptLoading, setReceiptLoading] = useState<Record<string, boolean>>({});
  const [receiptErrors, setReceiptErrors] = useState<Record<string, string>>({});
  const [verifications, setVerifications] = useState<
    Record<string, ReceiptVerifyResult>
  >({});
  const [verifyLoading, setVerifyLoading] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState<string | null>(null);

  async function load(showSpinner = false) {
    if (showSpinner) setRefreshing(true);
    try {
      const data = await fetchAllActions({ status: "COMPLETED", limit: 5000 });
      setActions(data);
      setError(null);
      setLastRefreshed(new Date());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    load();
    const interval = setInterval(() => load(), 15000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleExpand(actionId: string) {
    if (expandedId === actionId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(actionId);
    if (!receipts[actionId] && !receiptLoading[actionId]) {
      setReceiptLoading((p) => ({ ...p, [actionId]: true }));
      fetchReceipt(actionId)
        .then((r) => setReceipts((p) => ({ ...p, [actionId]: r })))
        .catch((err) =>
          setReceiptErrors((p) => ({ ...p, [actionId]: err.message }))
        )
        .finally(() =>
          setReceiptLoading((p) => ({ ...p, [actionId]: false }))
        );
    }
  }

  function handleVerify(e: React.MouseEvent, receiptId: string) {
    e.stopPropagation();
    if (verifyLoading[receiptId]) return;
    setVerifyLoading((p) => ({ ...p, [receiptId]: true }));
    verifyReceipt(receiptId)
      .then((result) =>
        setVerifications((p) => ({ ...p, [receiptId]: result }))
      )
      .catch(() =>
        setVerifications((p) => ({
          ...p,
          [receiptId]: {
            receipt_id: receiptId,
            hash_valid: false,
            stored_hash: "",
            computed_hash: "",
          },
        }))
      )
      .finally(() => setVerifyLoading((p) => ({ ...p, [receiptId]: false })));
  }

  function copyHash(hash: string, id: string) {
    navigator.clipboard.writeText(hash);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  // ── Stats ──────────────────────────────────────────────
  const stats = useMemo(() => {
    const total = actions.length;
    let verified = 0;
    let invalid = 0;
    for (const v of Object.values(verifications)) {
      if (v.hash_valid) verified++;
      else invalid++;
    }
    const pending = total - verified - invalid;
    const integrity =
      verified + invalid > 0
        ? ((verified / (verified + invalid)) * 100).toFixed(2)
        : "100.00";
    return { total, verified, invalid, pending, integrity };
  }, [actions, verifications]);

  return (
    <div className="p-6 lg:p-8 w-full">
      <PageHeader
        title="Receipts"
        subtitle={
          <span className="inline-flex items-center gap-2">
            <span>
              {loading
                ? "Loading receipts…"
                : `${stats.total.toLocaleString()} completed actions`}
            </span>
            {lastRefreshed && (
              <>
                <span style={{ color: "var(--text-muted)" }}>·</span>
                <span>
                  Refreshed {formatRelative(lastRefreshed.toISOString())}
                </span>
              </>
            )}
          </span>
        }
        actions={
          <>
            <LiveBadge refreshSeconds={15} />
            <button
              type="button"
              onClick={() => load(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 text-[12px] px-3 py-1.5 rounded-full font-medium transition-colors disabled:opacity-60"
              style={{
                color: "var(--text-2)",
                background: "color-mix(in srgb, var(--text) 4%, transparent)",
                border: "1px solid var(--border)",
              }}
              title="Refresh now"
            >
              <RefreshCw
                size={12}
                className={refreshing ? "animate-spin" : undefined}
              />
              Refresh
            </button>
          </>
        }
      />

      {error && (
        <div
          className="mb-5 rounded-xl px-4 py-3 text-[12px] font-mono flex items-center gap-3"
          style={{
            background: "rgba(248,113,113,0.08)",
            border: "1px solid rgba(248,113,113,0.25)",
            color: "#F87171",
          }}
        >
          <CircleAlert size={14} />
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-auto underline opacity-70 hover:opacity-100"
          >
            dismiss
          </button>
        </div>
      )}

      {/* Stat tiles */}
      <div className="mb-6">
        <StatTileGrid>
          <StatTile
            label="Total receipts"
            value={stats.total.toLocaleString()}
            hint="Completed actions, all time"
            icon={<Receipt size={13} />}
          />
          <StatTile
            label="Chain integrity"
            value={`${stats.integrity}%`}
            trend={Number(stats.integrity) >= 99.9 ? "up" : "neutral"}
            hint={`${stats.verified} verified, ${stats.invalid} invalid`}
            icon={<ShieldCheck size={13} />}
          />
          <StatTile
            label="Verified this session"
            value={stats.verified.toLocaleString()}
            trend={stats.verified > 0 ? "up" : "neutral"}
            hint="Click Verify on any row"
            icon={<Check size={13} />}
          />
          <StatTile
            label="Pending verification"
            value={stats.pending.toLocaleString()}
            hint="Not yet re-hashed this session"
            icon={<Hash size={13} />}
          />
        </StatTileGrid>
      </div>

      {/* Data table */}
      <DataTableShell
        title={`Receipt ledger · ${stats.total.toLocaleString()} rows`}
        actions={
          <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
            Click any row to inspect the receipt
          </span>
        }
        footer={
          loading
            ? "Loading…"
            : `Showing ${stats.total.toLocaleString()} receipts from COMPLETED actions`
        }
      >
        {loading ? (
          <div>
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="grid grid-cols-[180px_1fr_1fr_160px_140px] items-center gap-6 px-5 py-3.5"
                style={{
                  borderTop: i === 0 ? "none" : "1px solid var(--border)",
                }}
              >
                {[120, 180, 140, 100, 80].map((w, j) => (
                  <div
                    key={j}
                    className="h-3 rounded animate-pulse"
                    style={{
                      width: w,
                      background:
                        "color-mix(in srgb, var(--text) 5%, transparent)",
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
        ) : actions.length === 0 ? (
          <DataTableEmpty
            icon={<Receipt size={18} />}
            title="No receipts yet"
            description="When your agents complete actions, the ledger will grow here. Every receipt is SHA-256 hashed and verifiable."
          />
        ) : (
          <div>
            {/* Sticky header */}
            <div
              className="grid grid-cols-[180px_1fr_1fr_160px_140px] gap-6 px-5 py-3 sticky top-0 z-10"
              style={{
                background: "color-mix(in srgb, var(--bg) 92%, transparent)",
                borderBottom: "1px solid var(--border)",
                backdropFilter: "blur(8px)",
              }}
            >
              {["Action ID", "Entity", "Action", "Time", "Integrity"].map(
                (h) => (
                  <div
                    key={h}
                    className="text-[9px] font-semibold tracking-[0.14em] uppercase"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {h}
                  </div>
                )
              )}
            </div>

            {actions.map((row) => {
              const expanded = expandedId === row.action_id;
              const receipt = receipts[row.action_id];
              const rLoading = receiptLoading[row.action_id];
              const rError = receiptErrors[row.action_id];
              const verification = receipt
                ? verifications[receipt.receipt_id]
                : undefined;
              const vLoading = receipt
                ? verifyLoading[receipt.receipt_id]
                : false;

              return (
                <div
                  key={row.action_id}
                  style={{ borderTop: "1px solid var(--border)" }}
                >
                  <button
                    type="button"
                    onClick={() => handleExpand(row.action_id)}
                    className="w-full grid grid-cols-[180px_1fr_1fr_160px_140px] items-center gap-6 px-5 py-3 text-left transition-colors"
                    style={{
                      background: expanded
                        ? "color-mix(in srgb, var(--text) 3%, transparent)"
                        : "transparent",
                    }}
                    onMouseEnter={(e) => {
                      if (!expanded)
                        (e.currentTarget as HTMLElement).style.background =
                          "color-mix(in srgb, var(--text) 2%, transparent)";
                    }}
                    onMouseLeave={(e) => {
                      if (!expanded)
                        (e.currentTarget as HTMLElement).style.background =
                          "transparent";
                    }}
                  >
                    <span
                      className="font-mono text-[11px] truncate"
                      style={{ color: "var(--text)" }}
                    >
                      {row.action_id}
                    </span>
                    <span
                      className="font-mono text-[11px] truncate"
                      style={{ color: "var(--text-2)" }}
                      title={`${row.target_entity.entity_type}/${row.target_entity.entity_id}`}
                    >
                      {row.target_entity.entity_type}/{row.target_entity.entity_id}
                    </span>
                    <span
                      className="font-mono text-[11px] truncate"
                      style={{ color: "var(--text-2)" }}
                    >
                      {row.action_type}
                    </span>
                    <span
                      className="text-[11px] tabular-nums"
                      style={{ color: "var(--text-muted)" }}
                      title={formatAbsolute(row.created_at)}
                    >
                      {formatRelative(row.created_at)}
                    </span>
                    <span>
                      {verification ? (
                        verification.hash_valid ? (
                          <StatusPill status="SUCCESS">
                            <ShieldCheck size={10} />
                            Verified
                          </StatusPill>
                        ) : (
                          <StatusPill status="FAILED">
                            <ShieldAlert size={10} />
                            Invalid
                          </StatusPill>
                        )
                      ) : receipt ? (
                        <span
                          role="button"
                          onClick={(e) => handleVerify(e, receipt.receipt_id)}
                          className="inline-flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-full font-semibold cursor-pointer transition-colors"
                          style={{
                            color: "var(--text-2)",
                            background:
                              "color-mix(in srgb, var(--text) 5%, transparent)",
                            border: "1px solid var(--border)",
                          }}
                        >
                          <Hash size={10} />
                          {vLoading ? "Verifying…" : "Verify hash"}
                        </span>
                      ) : (
                        <span
                          className="text-[10px]"
                          style={{ color: "var(--text-muted)" }}
                        >
                          —
                        </span>
                      )}
                    </span>
                  </button>
                  {expanded && (
                    <div
                      className="px-5 pt-3 pb-5"
                      style={{
                        background:
                          "color-mix(in srgb, var(--text) 2%, transparent)",
                        borderTop: "1px solid var(--border)",
                      }}
                    >
                      {rLoading && (
                        <p
                          className="text-[12px]"
                          style={{ color: "var(--text-2)" }}
                        >
                          Loading receipt…
                        </p>
                      )}
                      {rError && (
                        <p
                          className="text-[12px] font-mono"
                          style={{ color: "#F87171" }}
                        >
                          {rError}
                        </p>
                      )}
                      {receipt && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3">
                            <ReceiptField
                              label="Receipt ID"
                              value={
                                <span
                                  className="font-mono text-[11px]"
                                  style={{ color: "var(--text)" }}
                                >
                                  {receipt.receipt_id}
                                </span>
                              }
                            />
                            <ReceiptField
                              label="Decision"
                              value={<StatusPill status={receipt.decision} />}
                            />
                            <ReceiptField
                              label="Rule"
                              value={
                                <span
                                  className="font-mono text-[11px]"
                                  style={{ color: "var(--text-2)" }}
                                >
                                  {receipt.rule_id ?? "—"}
                                  {receipt.rule_version && (
                                    <span
                                      className="ml-1"
                                      style={{ color: "var(--text-muted)" }}
                                    >
                                      v{receipt.rule_version}
                                    </span>
                                  )}
                                </span>
                              }
                            />
                            <ReceiptField
                              label="Executed at"
                              value={
                                <span
                                  className="text-[11px]"
                                  style={{ color: "var(--text-2)" }}
                                >
                                  {receipt.executed_at
                                    ? formatAbsolute(receipt.executed_at)
                                    : "—"}
                                </span>
                              }
                            />
                          </div>

                          <div>
                            <p
                              className="text-[9px] font-semibold uppercase tracking-[0.14em] mb-1.5"
                              style={{ color: "var(--text-muted)" }}
                            >
                              SHA-256 hash
                            </p>
                            <div className="flex items-center gap-2">
                              <code
                                className="flex-1 font-mono text-[11px] px-3 py-2 rounded-lg break-all"
                                style={{
                                  background:
                                    "color-mix(in srgb, var(--text) 3%, transparent)",
                                  border: "1px solid var(--border)",
                                  color: "var(--text)",
                                }}
                              >
                                {receipt.hash}
                              </code>
                              <button
                                onClick={() =>
                                  copyHash(receipt.hash, receipt.receipt_id)
                                }
                                className="inline-flex items-center gap-1.5 text-[10px] font-semibold px-3 py-2 rounded-lg transition-colors shrink-0"
                                style={{
                                  color: "var(--text-2)",
                                  background:
                                    "color-mix(in srgb, var(--text) 4%, transparent)",
                                  border: "1px solid var(--border)",
                                }}
                              >
                                {copied === receipt.receipt_id ? (
                                  <>
                                    <Check size={11} />
                                    Copied
                                  </>
                                ) : (
                                  <>
                                    <Copy size={11} />
                                    Copy
                                  </>
                                )}
                              </button>
                            </div>
                          </div>

                          {receipt.conditions_evaluated && (
                            <div>
                              <p
                                className="text-[9px] font-semibold uppercase tracking-[0.14em] mb-1.5"
                                style={{ color: "var(--text-muted)" }}
                              >
                                Conditions evaluated
                              </p>
                              <div className="space-y-1.5">
                                {Object.entries(receipt.conditions_evaluated).map(
                                  ([key, cond]) => (
                                    <div
                                      key={key}
                                      className="flex items-center gap-2 text-[12px]"
                                    >
                                      {cond.passed ? (
                                        <Check
                                          size={12}
                                          style={{ color: "#34D399" }}
                                        />
                                      ) : (
                                        <X
                                          size={12}
                                          style={{ color: "#F87171" }}
                                        />
                                      )}
                                      <span style={{ color: "var(--text-2)" }}>
                                        {cond.label}
                                      </span>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          )}

                          {!!receipt.execution_result && (
                            <div>
                              <p
                                className="text-[9px] font-semibold uppercase tracking-[0.14em] mb-1.5"
                                style={{ color: "var(--text-muted)" }}
                              >
                                Execution result
                              </p>
                              <pre
                                className="text-[11px] font-mono leading-relaxed whitespace-pre-wrap break-all rounded-lg p-3"
                                style={{
                                  color: "var(--text-2)",
                                  background:
                                    "color-mix(in srgb, var(--text) 3%, transparent)",
                                  border: "1px solid var(--border)",
                                  maxHeight: 280,
                                  overflow: "auto",
                                }}
                              >
                                {JSON.stringify(receipt.execution_result, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </DataTableShell>
    </div>
  );
}

function ReceiptField({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div>
      <p
        className="text-[9px] font-semibold uppercase tracking-[0.14em] mb-1"
        style={{ color: "var(--text-muted)" }}
      >
        {label}
      </p>
      <div>{value}</div>
    </div>
  );
}
