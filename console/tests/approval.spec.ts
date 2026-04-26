/**
 * Lane 3a smoke tests — Tier 1 from /plan-eng-review test plan.
 *
 * Covers:
 *   T1.1  PENDING renders identity card + args panel + approve/deny buttons
 *   T1.2  EXPIRED_ERROR variant
 *   T1.3  INVALID_SIG_ERROR variant — D20: action_id MUST NOT leak
 *   T1.4  ROTATED_ERROR variant
 *   T1.5  ALREADY_DECIDED_RACE variant
 *   T1.6  Approve flow → D24 in-place morph to DecisionReceipt card
 *   T1.7  D31 countdown disables buttons when token expires
 *
 * Tests mock the API at the network layer so they're independent of
 * Lane 1's progress. They assert the contract → render mapping.
 */
import { test, expect, type Page } from "@playwright/test";

const API = process.env.API_URL ?? "http://localhost:8001";
const ACTION_ID = "statis-test-1";
const SIG = "v1.eyJhY3QiOiJzdGF0aXMtdGVzdC0xIn0.AAAA";

type RouteHandler = (route: import("@playwright/test").Route) => Promise<void>;

const _api = (path: string) => `${API}${path}`;

async function mockGet(page: Page, payload: object) {
  await page.route(_api(`/a/${ACTION_ID}**`), async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(payload),
      });
      return;
    }
    await route.continue();
  });
}

async function mockPost(page: Page, payload: object) {
  await page.route(_api(`/a/${ACTION_ID}/decision**`), async (route) => {
    if (route.request().method() === "POST") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(payload),
      });
      return;
    }
    await route.continue();
  });
}

function farFutureExpiry(): string {
  return new Date(Date.now() + 60 * 60 * 1000).toISOString();
}

function pastExpiry(): string {
  return new Date(Date.now() - 60 * 1000).toISOString();
}

function basePending(overrides: Partial<{ expires_at: string; parameters: object }> = {}) {
  return {
    shape: "PENDING",
    action: {
      action_id: ACTION_ID,
      tenant_id: "tnt-test",
      action_type: "apply_discount",
      target_system: "stripe",
      target_entity: { customer_id: "cus_42" },
      parameters: overrides.parameters ?? { amount: 1500, reason: "retention" },
      proposed_at: new Date(Date.now() - 60_000).toISOString(),
      expires_at: overrides.expires_at ?? farFutureExpiry(),
      agent: {
        handle: "billing-bot",
        version: "v3.2.1",
        spawned_by: "deploys/v0.4.0",
        actions_today: 14,
        denied_today: 0,
        agent_class: "capability:retention",
        org_unit: "cs/retention",
        trust_source: "api_key",
      },
    },
  };
}

// ---------------------------------------------------------------------------
// T1.1 — PENDING renders the full surface
// ---------------------------------------------------------------------------

test("T1.1 PENDING renders identity card + args panel + buttons", async ({ page }) => {
  await mockGet(page, basePending());
  await page.goto(`/a/${ACTION_ID}?sig=${SIG}`);

  await expect(page.getByTestId("identity-card")).toBeVisible();
  await expect(page.getByTestId("identity-card")).toContainText("billing-bot");
  await expect(page.getByTestId("identity-card")).toContainText("v3.2.1");
  await expect(page.getByTestId("identity-card")).toContainText("14 actions today");

  await expect(page.getByTestId("args-panel")).toContainText("amount");
  await expect(page.getByTestId("args-panel")).toContainText("retention");

  await expect(page.getByTestId("approve-button")).toBeEnabled();
  await expect(page.getByTestId("deny-button")).toBeEnabled();

  await expect(page.getByTestId("countdown")).toContainText("expires in");
});

// ---------------------------------------------------------------------------
// T1.2 — EXPIRED_ERROR variant
// ---------------------------------------------------------------------------

test("T1.2 EXPIRED_ERROR shows yellow warn + recovery hint + action_id is OK to leak", async ({
  page,
}) => {
  await mockGet(page, {
    shape: "EXPIRED_ERROR",
    action_id: ACTION_ID,
    expired_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    recovery_hint: "Ask the agent to re-issue the request.",
  });
  await page.goto(`/a/${ACTION_ID}?sig=${SIG}`);

  const banner = page.getByTestId("state-banner");
  await expect(banner).toHaveAttribute("data-variant", "warn");
  await expect(banner).toContainText(/EXPIRED/i);
  await expect(page.getByTestId("expired-detail")).toContainText("re-issue");
  await expect(page.getByText(ACTION_ID)).toBeVisible();
});

// ---------------------------------------------------------------------------
// T1.3 — INVALID_SIG_ERROR — D20: NO action_id leak
// ---------------------------------------------------------------------------

test("T1.3 INVALID_SIG_ERROR shows red fail + DOES NOT leak action_id (D20)", async ({
  page,
}) => {
  await mockGet(page, {
    shape: "INVALID_SIG_ERROR",
    detail: "Token is invalid or tampered with.",
  });
  await page.goto(`/a/${ACTION_ID}?sig=${SIG}`);

  const banner = page.getByTestId("state-banner");
  await expect(banner).toHaveAttribute("data-variant", "fail");
  await expect(banner).toContainText(/INVALID/i);
  await expect(page.getByTestId("invalid-detail")).toContainText("invalid");

  // CRITICAL: the page must NOT render the action_id anywhere.
  await expect(page.locator("body")).not.toContainText(ACTION_ID);
});

// ---------------------------------------------------------------------------
// T1.4 — ROTATED_ERROR variant
// ---------------------------------------------------------------------------

test("T1.4 ROTATED_ERROR shows red fail + tenant rotated_at", async ({ page }) => {
  await mockGet(page, {
    shape: "ROTATED_ERROR",
    tenant_id: "tnt-test",
    rotated_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    detail: "The tenant signing key was rotated; this link is no longer valid.",
  });
  await page.goto(`/a/${ACTION_ID}?sig=${SIG}`);

  const banner = page.getByTestId("state-banner");
  await expect(banner).toHaveAttribute("data-variant", "fail");
  await expect(banner).toContainText(/INVALIDATED/i);
  await expect(page.getByTestId("rotated-detail")).toContainText("rotated");
});

// ---------------------------------------------------------------------------
// T1.5 — ALREADY_DECIDED_RACE
// ---------------------------------------------------------------------------

test("T1.5 ALREADY_DECIDED_RACE shows ok banner + receipt link (D32)", async ({ page }) => {
  await mockGet(page, {
    shape: "ALREADY_DECIDED_RACE",
    action_id: ACTION_ID,
    decision: "APPROVED",
    decided_at: new Date().toISOString(),
    decided_by: "alice@example.com",
    receipt_url: "/r/tnt-test/rcpt-1",
  });
  await page.goto(`/a/${ACTION_ID}?sig=${SIG}`);

  const banner = page.getByTestId("state-banner");
  await expect(banner).toHaveAttribute("data-variant", "ok");
  await expect(banner).toContainText(/ALREADY DECIDED/i);
  await expect(page.getByRole("link", { name: /receipt/i })).toHaveAttribute(
    "href",
    "/r/tnt-test/rcpt-1",
  );
});

// ---------------------------------------------------------------------------
// T1.6 — Approve flow + D24 in-place morph
// ---------------------------------------------------------------------------

test("T1.6 Approve → in-place morph to DecisionReceipt card (D24)", async ({ page }) => {
  await mockGet(page, basePending());
  await mockPost(page, {
    shape: "DECISION_RECEIPT",
    action_id: ACTION_ID,
    decision: "APPROVED",
    decided_at: new Date().toISOString(),
    decided_by: "alice@example.com",
    receipt_id: "rcpt-1",
    receipt_url: "/r/tnt-test/rcpt-1",
    signature_alg: "ed25519-v1",
    public_key_id: "stat-ed25519-dev",
  });

  await page.goto(`/a/${ACTION_ID}?sig=${SIG}`);
  await expect(page.getByTestId("approve-button")).toBeVisible();

  await page.getByTestId("approve-button").click();

  const receiptCard = page.getByTestId("decision-receipt");
  await expect(receiptCard).toBeVisible();
  await expect(receiptCard).toContainText("rcpt-1");
  await expect(receiptCard).toContainText("ed25519");
  // The args panel STAYS in DOM during morph (D24 visual continuity).
  await expect(page.getByTestId("args-panel")).toBeVisible();
  // Buttons are gone.
  await expect(page.getByTestId("approve-button")).toHaveCount(0);
});

// ---------------------------------------------------------------------------
// T1.7 — D31 expired countdown disables buttons inline
// ---------------------------------------------------------------------------

test("T1.7 D31 expired token disables buttons + shows expired banner", async ({ page }) => {
  await mockGet(page, basePending({ expires_at: pastExpiry() }));
  await page.goto(`/a/${ACTION_ID}?sig=${SIG}`);

  // Wait for the per-second tick to register the expiry.
  await expect(page.getByTestId("countdown")).toContainText("expired", { timeout: 2_000 });
  await expect(page.getByTestId("approve-button")).toBeDisabled();
  await expect(page.getByTestId("deny-button")).toBeDisabled();
  await expect(page.getByTestId("expired-banner")).toBeVisible();
});
