/**
 * Lane 3b — AuditPanel smoke tests.
 *
 * Full graduation overlay (5 interaction states from D22) is
 * Tier-2 / Show-HN scope per the eng-review test plan T3 sequencing.
 * v1 ships the AuditPanel fetch + render correctness only — that's
 * what gates Lane 1's GET /actions/{id}/similar contract.
 *
 * Covers:
 *   AP1   panel renders when count > 0
 *   AP2   panel renders nothing when count == 0
 *   AP3   panel renders nothing when fetch errors
 */
import { test, expect, type Page } from "@playwright/test";

const API = process.env.API_URL ?? "http://localhost:8001";
const ACTION_ID = "statis-audit-1";
const SIG = "v1.eyJhY3QiOiJzdGF0aXMtYXVkaXQtMSJ9.AAAA";


async function mockApprovalGet(page: Page) {
  await page.route(`${API}/a/${ACTION_ID}**`, async (route) => {
    if (route.request().method() !== "GET") {
      await route.continue();
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        shape: "PENDING",
        action: {
          action_id: ACTION_ID,
          tenant_id: "tnt-test",
          action_type: "apply_discount",
          target_system: "stripe",
          target_entity: { customer_id: "cus_42" },
          parameters: { amount: 1500 },
          proposed_at: new Date(Date.now() - 60_000).toISOString(),
          expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
          agent: {
            handle: "billing-bot",
            actions_today: 1,
            denied_today: 0,
          },
        },
      }),
    });
  });
}

async function mockSimilar(page: Page, payload: object | null, status = 200) {
  await page.route(`${API}/actions/${ACTION_ID}/similar**`, async (route) => {
    if (payload === null) {
      await route.fulfill({ status, body: "" });
      return;
    }
    await route.fulfill({
      status,
      contentType: "application/json",
      body: JSON.stringify(payload),
    });
  });
}


test("AP1 AuditPanel renders when there are prior approvals", async ({ page }) => {
  await mockApprovalGet(page);
  await mockSimilar(page, {
    count: 2,
    window_seconds: 48 * 3600,
    approvals: [
      {
        action_id: "statis-prev-1",
        decided_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
        decided_by: "alice@example.com",
        decision: "APPROVED",
      },
      {
        action_id: "statis-prev-2",
        decided_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
        decided_by: "bob@example.com",
        decision: "APPROVED",
      },
    ],
  });

  await page.goto(`/a/${ACTION_ID}?sig=${SIG}`);

  const panel = page.getByTestId("audit-panel");
  await expect(panel).toBeVisible();
  await expect(panel).toContainText(/2 prior identical approvals/i);

  // Open the details to see the rows.
  await panel.locator("summary").click();
  await expect(panel).toContainText("statis-prev-1");
  await expect(panel).toContainText("alice@example.com");
});


test("AP2 AuditPanel hidden when count == 0", async ({ page }) => {
  await mockApprovalGet(page);
  await mockSimilar(page, {
    count: 0,
    window_seconds: 48 * 3600,
    approvals: [],
  });

  await page.goto(`/a/${ACTION_ID}?sig=${SIG}`);
  await expect(page.getByTestId("identity-card")).toBeVisible();
  await expect(page.getByTestId("audit-panel")).toHaveCount(0);
});


test("AP3 AuditPanel hidden on fetch error (degrades gracefully)", async ({ page }) => {
  await mockApprovalGet(page);
  await mockSimilar(page, null, 500);

  await page.goto(`/a/${ACTION_ID}?sig=${SIG}`);
  await expect(page.getByTestId("identity-card")).toBeVisible();
  await expect(page.getByTestId("audit-panel")).toHaveCount(0);
});
