/**
 * Lane 3b smoke tests — Tier 1 (T1.8-T1.10).
 *
 *   T1.8   VERIFIED → "SIGNATURE VERIFIED · ED25519" ok banner (D17)
 *          + DOM does NOT contain "CHAIN INTACT" (OV-T3 v1 contract)
 *   T1.9   FAILED   → "SIGNATURE FAILED" red banner + which check failed (D21)
 *   T1.10  UNSIGNED → "UNSIGNED RECEIPT" warn banner (legacy)
 *
 * All tests mock the API at the network layer. ROADMAP footer (OV-T3)
 * is asserted in T1.8 because it's the v1 trust message.
 */
import { test, expect, type Page } from "@playwright/test";

const API = process.env.API_URL ?? "http://localhost:8001";
const TENANT_ID = "tnt-test";
const RECEIPT_ID = "rcpt-public-1";


async function mockReceipt(page: Page, payload: object) {
  await page.route(`${API}/r/${TENANT_ID}/${RECEIPT_ID}`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(payload),
    });
  });
}

function baseReceipt() {
  return {
    receipt_id: RECEIPT_ID,
    action_id: "statis-test-1",
    tenant_id: TENANT_ID,
    decision: "APPROVED",
    rule_id: "apply_discount_v1",
    rule_version: "1",
    approved_by: "alice@example.com",
    conditions_evaluated: { amount_under_500: { passed: true } },
    execution_result: { stripe_charge_id: "ch_42", refunded_cents: 1500 },
    executed_at: new Date(Date.now() - 60_000).toISOString(),
    hash: "a2f8b1c90c93b6eedeadbeefcafebabe1234567890abcdef0123456789abcdef",
    created_at: new Date().toISOString(),
    signature: "AAAAA",
    signature_alg: "ed25519-v1",
    public_key_id: "stat-ed25519-dev",
  };
}

// ---------------------------------------------------------------------------
// T1.8 — VERIFIED
// ---------------------------------------------------------------------------

test("T1.8 SIGNATURE VERIFIED · ED25519 banner — NO chain badge in v1 (OV-T3)", async ({
  page,
}) => {
  await mockReceipt(page, {
    receipt: baseReceipt(),
    verification: {
      state: "VERIFIED",
      signature_alg: "ed25519-v1",
      public_key_id: "stat-ed25519-dev",
    },
  });

  await page.goto(`/r/${TENANT_ID}/${RECEIPT_ID}`);

  const banner = page.getByTestId("state-banner");
  await expect(banner).toHaveAttribute("data-variant", "ok");
  await expect(banner).toContainText(/SIGNATURE VERIFIED/i);
  await expect(banner).toContainText(/ED25519/i);

  // CRITICAL: v1 ships sig only. The chain badge re-enters with Receipt v2.
  await expect(page.locator("body")).not.toContainText(/CHAIN INTACT/i);

  // Decision summary present.
  await expect(page.getByText(/apply_discount_v1/)).toBeVisible();
  await expect(page.getByText(/alice@example.com/)).toBeVisible();

  // Execution result panel present.
  await expect(page.getByText(/ch_42/)).toBeVisible();

  // OV-T3 ROADMAP footer.
  await expect(page.getByTestId("roadmap-footer")).toContainText(/Receipt v2/);
  await expect(page.getByTestId("roadmap-footer")).toContainText(/statis verify/);
});

// ---------------------------------------------------------------------------
// T1.9 — FAILED
// ---------------------------------------------------------------------------

test("T1.9 SIGNATURE FAILED banner identifies which check failed (D21)", async ({ page }) => {
  await mockReceipt(page, {
    receipt: baseReceipt(),
    verification: {
      state: "FAILED",
      signature_alg: "ed25519-v1",
      public_key_id: "stat-ed25519-dev",
      check: "ed25519 signature did not match",
    },
  });

  await page.goto(`/r/${TENANT_ID}/${RECEIPT_ID}`);

  const banner = page.getByTestId("state-banner");
  await expect(banner).toHaveAttribute("data-variant", "fail");
  await expect(banner).toContainText(/SIGNATURE FAILED/i);
  await expect(banner).toContainText(/did not match/i);
});

// ---------------------------------------------------------------------------
// T1.10 — UNSIGNED (legacy)
// ---------------------------------------------------------------------------

test("T1.10 UNSIGNED legacy receipt shows warn banner", async ({ page }) => {
  const r = baseReceipt();
  r.signature = null as unknown as string;
  r.signature_alg = null as unknown as string;
  r.public_key_id = null as unknown as string;
  await mockReceipt(page, {
    receipt: r,
    verification: { state: "UNSIGNED" },
  });

  await page.goto(`/r/${TENANT_ID}/${RECEIPT_ID}`);

  const banner = page.getByTestId("state-banner");
  await expect(banner).toHaveAttribute("data-variant", "warn");
  await expect(banner).toContainText(/UNSIGNED/i);
  await expect(banner).toContainText(/AARM R5/);
});
