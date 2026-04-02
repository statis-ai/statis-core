"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  fetchAllActions,
  fetchReceipt,
  verifyReceipt,
  type ActionContract,
  type ReceiptDetail,
  type ReceiptVerifyResult,
} from "@/lib/api";

function formatTime(iso: string): string {
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
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [receipts, setReceipts] = useState<Record<string, ReceiptDetail>>({});
  const [receiptLoading, setReceiptLoading] = useState<Record<string, boolean>>({});
  const [receiptErrors, setReceiptErrors] = useState<Record<string, string>>({});
  const [verifications, setVerifications] = useState<Record<string, ReceiptVerifyResult>>({});
  const [verifyLoading, setVerifyLoading] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    fetchAllActions({ status: "COMPLETED", limit: 100 })
      .then((data) => {
        setActions(data);
        setError(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleExpand = (actionId: string) => {
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
        .finally(() => setReceiptLoading((p) => ({ ...p, [actionId]: false })));
    }
  };

  const handleVerify = (e: React.MouseEvent, receiptId: string) => {
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
  };

  const copyHash = (hash: string, id: string) => {
    navigator.clipboard.writeText(hash);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-[20px] font-semibold text-white">Receipts</h1>
        <p className="text-xs text-[#444444] mt-0.5">
          {loading ? "Loading..." : `${actions.length} completed actions`}
        </p>
      </div>

      {loading ? (
        <p className="text-[#888888] text-sm">Loading...</p>
      ) : error ? (
        <p className="text-red-400 text-sm">{error}</p>
      ) : actions.length === 0 ? (
        <p className="text-[#444444] text-sm">No data</p>
      ) : (
        <div className="bg-[#111111] rounded border border-[#1a1a1a] overflow-hidden">
          <table className="w-full">
            <thead className="bg-[#0a0a0a] border-b border-[#1a1a1a]">
              <tr className="text-[10px] uppercase tracking-widest text-[#444444]">
                <th className="text-left px-5 py-3 font-semibold">Action ID</th>
                <th className="text-left px-5 py-3 font-semibold">Entity</th>
                <th className="text-left px-5 py-3 font-semibold">Action Type</th>
                <th className="text-left px-5 py-3 font-semibold">Time</th>
                <th className="text-left px-5 py-3 font-semibold">Verify</th>
              </tr>
            </thead>
            <tbody>
              {actions.map((row) => {
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
                  <tr key={row.action_id}>
                    <td colSpan={5} className="p-0">
                      <div
                        className="grid grid-cols-[1fr_1fr_1fr_auto_auto] items-center hover:bg-white/[0.02] transition-colors cursor-pointer"
                        onClick={() => handleExpand(row.action_id)}
                      >
                        <span className="px-5 py-3 font-mono text-xs text-[#d4d4d4]">
                          {row.action_id}
                        </span>
                        <span className="px-5 py-3 font-mono text-xs text-[#888888]">
                          {row.target_entity.entity_type}/{row.target_entity.entity_id}
                        </span>
                        <span className="px-5 py-3 font-mono text-xs text-[#888888]">
                          {row.action_type}
                        </span>
                        <span className="px-5 py-3 text-[11px] text-[#444444] whitespace-nowrap">
                          {formatTime(row.created_at)}
                        </span>
                        <span className="px-5 py-3">
                          {receipt && !verification && (
                            <button
                              onClick={(e) => handleVerify(e, receipt.receipt_id)}
                              disabled={vLoading}
                              className="text-[10px] font-medium px-3 py-1 rounded border border-[#1a1a1a] text-[#888888] hover:text-white hover:border-white/20 transition-colors disabled:opacity-50"
                            >
                              {vLoading ? "..." : "Verify"}
                            </button>
                          )}
                          {verification && (
                            <span
                              className={cn(
                                "text-[10px] font-medium flex items-center gap-1",
                                verification.hash_valid
                                  ? "text-emerald-400"
                                  : "text-red-400"
                              )}
                            >
                              {verification.hash_valid ? (
                                <>
                                  <svg
                                    width="12"
                                    height="12"
                                    viewBox="0 0 12 12"
                                    fill="none"
                                    className="shrink-0"
                                  >
                                    <path
                                      d="M2.5 6L5 8.5L9.5 3.5"
                                      stroke="currentColor"
                                      strokeWidth="1.5"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                  Hash valid
                                </>
                              ) : (
                                <>
                                  <svg
                                    width="12"
                                    height="12"
                                    viewBox="0 0 12 12"
                                    fill="none"
                                    className="shrink-0"
                                  >
                                    <path
                                      d="M3 3L9 9M9 3L3 9"
                                      stroke="currentColor"
                                      strokeWidth="1.5"
                                      strokeLinecap="round"
                                    />
                                  </svg>
                                  Hash invalid
                                </>
                              )}
                            </span>
                          )}
                          {!receipt && !rLoading && (
                            <span className="text-[#444444] text-[10px]">--</span>
                          )}
                        </span>
                      </div>

                      {expandedId === row.action_id && (
                        <div className="px-5 pb-4 border-t border-[#1a1a1a] bg-[#0a0a0a]">
                          {rLoading && (
                            <p className="text-[#888888] text-xs pt-3">Loading receipt...</p>
                          )}
                          {rError && (
                            <p className="text-red-400 text-xs pt-3">{rError}</p>
                          )}
                          {receipt && (
                            <div className="pt-3 space-y-3">
                              <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                                <div>
                                  <p className="text-[10px] uppercase tracking-widest text-[#444444] mb-0.5">
                                    Receipt ID
                                  </p>
                                  <p className="font-mono text-xs text-[#d4d4d4]">
                                    {receipt.receipt_id}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-[10px] uppercase tracking-widest text-[#444444] mb-0.5">
                                    Decision
                                  </p>
                                  <span
                                    className={cn(
                                      "text-[10px] font-medium px-2 py-0.5 rounded border",
                                      receipt.decision === "APPROVED"
                                        ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20"
                                        : receipt.decision === "DENIED"
                                        ? "bg-red-500/15 text-red-400 border-red-500/20"
                                        : "bg-white/5 text-[#888888] border-[#1a1a1a]"
                                    )}
                                  >
                                    {receipt.decision}
                                  </span>
                                </div>
                                <div>
                                  <p className="text-[10px] uppercase tracking-widest text-[#444444] mb-0.5">
                                    Rule
                                  </p>
                                  <p className="font-mono text-xs text-[#888888]">
                                    {receipt.rule_id ?? "--"}{" "}
                                    {receipt.rule_version && (
                                      <span className="text-[#444444]">
                                        v{receipt.rule_version}
                                      </span>
                                    )}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-[10px] uppercase tracking-widest text-[#444444] mb-0.5">
                                    Executed At
                                  </p>
                                  <p className="text-xs text-[#888888]">
                                    {receipt.executed_at
                                      ? formatTime(receipt.executed_at)
                                      : "--"}
                                  </p>
                                </div>
                              </div>

                              <div>
                                <p className="text-[10px] uppercase tracking-widest text-[#444444] mb-0.5">
                                  Hash
                                </p>
                                <div className="flex items-center gap-2">
                                  <code className="font-mono text-xs text-[#d4d4d4] bg-white/[0.03] px-2 py-1 rounded border border-[#1a1a1a] break-all">
                                    {receipt.hash}
                                  </code>
                                  <button
                                    onClick={() =>
                                      copyHash(receipt.hash, receipt.receipt_id)
                                    }
                                    className="text-[10px] text-[#444444] hover:text-white transition-colors shrink-0 px-2 py-1 rounded border border-[#1a1a1a] hover:border-white/20"
                                  >
                                    {copied === receipt.receipt_id ? "Copied" : "Copy"}
                                  </button>
                                </div>
                              </div>

                              {receipt.conditions_evaluated && (
                                <div>
                                  <p className="text-[10px] uppercase tracking-widest text-[#444444] mb-1">
                                    Conditions
                                  </p>
                                  <div className="space-y-1">
                                    {Object.entries(receipt.conditions_evaluated).map(
                                      ([key, cond]) => (
                                        <div
                                          key={key}
                                          className="flex items-center gap-2 text-xs"
                                        >
                                          <span
                                            className={cn(
                                              "w-1.5 h-1.5 rounded-full shrink-0",
                                              cond.passed
                                                ? "bg-emerald-400"
                                                : "bg-red-400"
                                            )}
                                          />
                                          <span className="text-[#888888]">
                                            {cond.label}
                                          </span>
                                        </div>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}

                              {receipt.execution_result && (
                                <div>
                                  <p className="text-[10px] uppercase tracking-widest text-[#444444] mb-1">
                                    Execution Result
                                  </p>
                                  <pre className="text-xs text-[#888888] whitespace-pre-wrap break-all">
                                    {JSON.stringify(
                                      receipt.execution_result,
                                      null,
                                      2
                                    )}
                                  </pre>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
