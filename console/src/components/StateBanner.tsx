/**
 * StateBanner — D17 (verified) + D21 (failed verification)
 *
 * v1 ships SIGNATURE VERIFIED · ED25519 only — NO "CHAIN INTACT 247/247"
 * badge yet. The chain badge re-enters when Receipt v2 ships in Week 2
 * (atomic with `receipt_N-1_hash` linkage). See OV-T3 + the
 * receipt-v2-chain-ui TODO in the design review delta.
 *
 * Three rendered states:
 *   ok    → "SIGNATURE VERIFIED · ED25519" + small caption with crypto details
 *   fail  → "SIGNATURE FAILED" + which check failed + pubkey fingerprint
 *   warn  → expired token / unsigned receipt (legacy)
 */
import * as React from "react";

export type BannerVariant = "ok" | "fail" | "warn";

export interface StateBannerProps {
  variant: BannerVariant;
  title: string;
  caption?: string;
}

const ICON: Record<BannerVariant, string> = {
  ok: "✓",
  fail: "✕",
  warn: "!",
};

export function StateBanner({
  variant,
  title,
  caption,
}: StateBannerProps): React.ReactElement {
  return (
    <div
      className={`state-banner state-banner--${variant}`}
      data-testid="state-banner"
      data-variant={variant}
      role={variant === "ok" ? "status" : "alert"}
    >
      <span className="state-banner__icon" aria-hidden="true">
        {ICON[variant]}
      </span>
      <strong>{title}</strong>
      {caption ? (
        <span className="state-banner__caption">{caption}</span>
      ) : null}
    </div>
  );
}
