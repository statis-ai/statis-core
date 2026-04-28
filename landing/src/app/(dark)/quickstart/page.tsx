"use client";

import { useState } from "react";
import { PageV6Shell } from "@/components/v6/PageV6Shell";
import type { Metadata } from "next";

// metadata can't be exported from a client component — see layout.tsx

const INSTALL = "pip install statis-ai";

const STEP_CODE = [
  {
    num: "01",
    label: "Install",
    code: `pip install statis-ai`,
    lang: "bash",
    note: null,
  },
  {
    num: "02",
    label: "Get your API key",
    code: `statis init`,
    lang: "bash",
    note: "Interactive signup — writes your key to ~/.statis/config.json",
  },
  {
    num: "03",
    label: "Decorate a function",
    code: `from statis_ai import gate

@gate(action_type="stripe_refund")
def refund(charge_id: str, cents: int) -> dict:
    import stripe
    return stripe.refunds.create(charge=charge_id, amount=cents)`,
    lang: "python",
    note: "The decorator wraps any function your agent calls.",
  },
  {
    num: "04",
    label: "Call it — the gate escalates",
    code: `result = refund(charge_id="ch_abc123", cents=5000)

# ActionEscalatedError: Action stripe_refund is pending approval.
#   Approval URL: https://approval.statis.dev/a/tok_...
#   Expires: 2026-04-28T14:32:00Z`,
    lang: "python",
    note: "No matching policy rule → escalates. Open the URL in any browser.",
  },
  {
    num: "05",
    label: "Approve from the URL",
    code: `# Open the approval URL in your browser.
# You'll see:
#   Action:   stripe_refund
#   Args:     charge_id=ch_abc123, cents=5000
#
# Click Approve.`,
    lang: "python",
    note: "One click. No login — the signed URL is the credential.",
  },
  {
    num: "06",
    label: "Re-run — it executes and receipts",
    code: `result = refund(charge_id="ch_abc123", cents=5000)
# {"id": "re_abc123", "amount": 5000, "status": "succeeded"}

# A tamper-evident receipt is written to the ledger:
# receipt_01hwx...  stripe_refund  APPROVED  sha256:a3f8...`,
    lang: "python",
    note: "After approval, the gate unblocks immediately. Receipt is permanent.",
  },
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1400);
      }}
      style={{
        fontFamily: "var(--font)",
        fontSize: 9,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: copied ? "var(--accent)" : "var(--text-subtle)",
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: "0 2px",
        transition: "color 0.15s",
        flexShrink: 0,
      }}
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function StepCard({ step }: { step: typeof STEP_CODE[0] }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 24,
        paddingBottom: 36,
        borderBottom: "1px solid var(--border)",
      }}
    >
      {/* Step number */}
      <div
        style={{
          fontFamily: "var(--font)",
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.18em",
          color: "var(--accent)",
          flexShrink: 0,
          paddingTop: 2,
          width: 28,
        }}
      >
        {step.num}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Label */}
        <p
          style={{
            fontFamily: "var(--font)",
            fontSize: 13,
            fontWeight: 600,
            color: "var(--text)",
            marginBottom: 12,
            letterSpacing: "-0.01em",
          }}
        >
          {step.label}
        </p>

        {/* Code block */}
        <div
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            overflow: "hidden",
          }}
        >
          {/* Chrome bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "8px 14px",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font)",
                fontSize: 9,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--text-subtle)",
              }}
            >
              {step.lang}
            </span>
            <CopyButton text={step.code} />
          </div>
          {/* Code */}
          <pre
            style={{
              margin: 0,
              padding: "14px 18px",
              fontFamily: "var(--font)",
              fontSize: 12.5,
              lineHeight: 1.7,
              color: "var(--text-2)",
              overflowX: "auto",
              whiteSpace: "pre",
            }}
          >
            {step.code}
          </pre>
        </div>

        {/* Note */}
        {step.note && (
          <p
            style={{
              fontFamily: "var(--font)",
              fontSize: 11,
              color: "var(--text-subtle)",
              marginTop: 8,
            }}
          >
            {step.note}
          </p>
        )}
      </div>
    </div>
  );
}

export default function QuickstartPage() {
  const [copied, setCopied] = useState(false);

  return (
    <PageV6Shell currentRoute="/quickstart">
      {/* Hero */}
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "64px 40px 48px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginBottom: 24,
          }}
        >
          <span
            style={{
              fontFamily: "var(--font)",
              fontSize: 10,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "var(--accent)",
              fontWeight: 600,
            }}
          >
            § 01
          </span>
          <span
            style={{
              display: "inline-block",
              width: 24,
              height: 1,
              background: "var(--accent)",
            }}
          />
          <span
            style={{
              fontFamily: "var(--font)",
              fontSize: 10,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "var(--text-muted)",
            }}
          >
            Quickstart
          </span>
        </div>

        <h1
          style={{
            fontFamily: "var(--font)",
            fontWeight: 300,
            fontSize: "clamp(28px, 4vw, 48px)",
            lineHeight: 1.08,
            letterSpacing: "-0.03em",
            color: "var(--text)",
            marginBottom: 20,
          }}
        >
          From zero to{" "}
          <strong style={{ fontWeight: 600, color: "var(--accent)" }}>
            first receipt
          </strong>{" "}
          in 5 minutes.
        </h1>

        <p
          style={{
            fontFamily: "var(--font)",
            fontSize: 14,
            lineHeight: 1.65,
            color: "var(--text-2)",
            marginBottom: 28,
            paddingLeft: 16,
            borderLeft: "2px solid var(--accent-border)",
          }}
        >
          Install <code style={{ color: "var(--accent)", fontSize: "0.9em" }}>statis-ai</code>,
          decorate one function, call it, approve from the URL, see the receipt.
          Six steps. No config files, no YAML, no infrastructure.
        </p>

        {/* Install pill */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "stretch",
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            overflow: "hidden",
            marginBottom: 12,
          }}
        >
          <span
            style={{
              fontFamily: "var(--font)",
              fontSize: 13,
              padding: "10px 6px 10px 16px",
              color: "var(--accent)",
              userSelect: "none",
            }}
          >
            $
          </span>
          <span
            style={{
              fontFamily: "var(--font)",
              fontSize: 13,
              padding: "10px 16px 10px 8px",
              color: "var(--text-2)",
              flex: 1,
            }}
          >
            {INSTALL}
          </span>
          <button
            onClick={() => {
              navigator.clipboard.writeText(INSTALL);
              setCopied(true);
              setTimeout(() => setCopied(false), 1400);
            }}
            style={{
              fontFamily: "var(--font)",
              fontSize: 10,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              padding: "0 14px",
              background: copied ? "var(--accent-bg)" : "var(--bg-elev)",
              color: copied ? "var(--accent)" : "var(--text-subtle)",
              border: "none",
              borderLeft: "1px solid var(--border)",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>

        <p
          style={{
            fontFamily: "var(--font)",
            fontSize: 11,
            color: "var(--text-subtle)",
          }}
        >
          Python 3.9+ · PyPI ·{" "}
          <a
            href="https://github.com/statis-ai/statis-core/tree/main/sdk"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--accent)", textDecoration: "none" }}
          >
            open source →
          </a>
        </p>
      </div>

      {/* Steps */}
      <div
        style={{
          maxWidth: 680,
          margin: "0 auto",
          padding: "0 40px",
          display: "flex",
          flexDirection: "column",
          gap: 36,
        }}
      >
        {STEP_CODE.map((step) => (
          <StepCard key={step.num} step={step} />
        ))}

        {/* What just happened */}
        <div>
          <p
            style={{
              fontFamily: "var(--font)",
              fontSize: 13,
              fontWeight: 600,
              color: "var(--text)",
              marginBottom: 14,
              letterSpacing: "-0.01em",
            }}
          >
            What just happened
          </p>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            {[
              ["Propose", "The gate captured stripe_refund(charge_id, cents) and sent it to Statis."],
              ["Approve", "No matching policy rule → escalated → you approved at the URL."],
              ["Execute", "The real refund() ran and returned the Stripe response."],
              ["Receipt", "A tamper-evident record was written and hash-chained to the ledger."],
            ].map(([label, desc]) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  gap: 14,
                  padding: "12px 16px",
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius)",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font)",
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "var(--accent)",
                    flexShrink: 0,
                    paddingTop: 1,
                    width: 60,
                  }}
                >
                  {label}
                </span>
                <span
                  style={{
                    fontFamily: "var(--font)",
                    fontSize: 12,
                    lineHeight: 1.6,
                    color: "var(--text-2)",
                  }}
                >
                  {desc}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Next steps */}
        <div style={{ paddingTop: 8, paddingBottom: 80 }}>
          <p
            style={{
              fontFamily: "var(--font)",
              fontSize: 13,
              fontWeight: 600,
              color: "var(--text)",
              marginBottom: 14,
              letterSpacing: "-0.01em",
            }}
          >
            Next steps
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
            }}
          >
            {[
              {
                label: "Write a policy rule",
                desc: "Auto-approve refunds under $100 without a human.",
                href: "https://docs.statis.dev/policies/rules",
              },
              {
                label: "Gate reference",
                desc: "Full @gate signature, params, and error classes.",
                href: "https://docs.statis.dev/gate/reference",
              },
              {
                label: "Policy graduation",
                desc: "How 3 approvals become a YAML rule automatically.",
                href: "https://docs.statis.dev/gate/policy-graduation",
              },
              {
                label: "Async agents",
                desc: "mode='auto' dispatch and asyncio pitfalls.",
                href: "https://docs.statis.dev/gate/sync-vs-async",
              },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                  padding: "14px 16px",
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius)",
                  textDecoration: "none",
                  transition: "border-color 0.15s",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font)",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "var(--text)",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {item.label} →
                </span>
                <span
                  style={{
                    fontFamily: "var(--font)",
                    fontSize: 11,
                    color: "var(--text-subtle)",
                    lineHeight: 1.5,
                  }}
                >
                  {item.desc}
                </span>
              </a>
            ))}
          </div>

          <div
            style={{
              marginTop: 28,
              padding: "20px 20px",
              background: "var(--accent-bg)",
              border: "1px solid var(--accent-border)",
              borderRadius: "var(--radius)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 20,
              flexWrap: "wrap",
            }}
          >
            <p
              style={{
                fontFamily: "var(--font)",
                fontSize: 12,
                color: "var(--text)",
              }}
            >
              Stuck or have questions? We reply to everyone.
            </p>
            <a
              href="mailto:hello@statis.dev?subject=Quickstart%20question"
              style={{
                fontFamily: "var(--font)",
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#0a0a0a",
                background: "var(--accent)",
                padding: "8px 16px",
                borderRadius: "2px",
                textDecoration: "none",
                flexShrink: 0,
              }}
            >
              Talk to a founder →
            </a>
          </div>
        </div>
      </div>
    </PageV6Shell>
  );
}
