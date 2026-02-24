import { test, expect } from "@playwright/test";

const API = process.env.API_URL ?? "http://localhost:8001";

async function seedEntity(entityType: string, entityId: string) {
  const events = [
    {
      event_id: `seed-${entityId}-1`,
      entity_type: entityType,
      entity_id: entityId,
      event_type: "account.opened",
      payload: { plan: "free", owner: "test-user" },
      occurred_at: "2025-01-01T00:00:00Z",
      producer: "playwright-seed",
      schema_version: "1",
    },
    {
      event_id: `seed-${entityId}-2`,
      entity_type: entityType,
      entity_id: entityId,
      event_type: "plan.changed",
      payload: { plan: "pro", changed_by: "admin" },
      occurred_at: "2025-01-02T00:00:00Z",
      producer: "playwright-seed",
      schema_version: "1",
    },
    {
      event_id: `seed-${entityId}-3`,
      entity_type: entityType,
      entity_id: entityId,
      event_type: "ticket.updated",
      payload: {
        ticket_id: "TK-100",
        status: "open",
        priority: "high",
        assigned_to: "agent-1",
      },
      occurred_at: "2025-01-03T00:00:00Z",
      producer: "playwright-seed",
      schema_version: "1",
    },
  ];

  for (const ev of events) {
    await fetch(`${API}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ev),
    });
  }
}

test.describe("Account Inspector", () => {
  const entityType = "account";
  const entityId = `pw-test-${Date.now()}`;

  test.beforeAll(async () => {
    await seedEntity(entityType, entityId);
  });

  test("load inspector and verify state tab", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator("h1")).toHaveText("Statis Console");

    await page.locator("select").selectOption(entityType);
    await page.locator('input[type="text"]').fill(entityId);
    await page.locator("button", { hasText: "Inspect" }).click();

    const stateJson = page.locator('[data-testid="state-json"]');
    await expect(stateJson).toBeVisible({ timeout: 10_000 });

    const text = await stateJson.textContent();
    expect(text).toBeTruthy();
    expect(text!.length).toBeGreaterThan(2);
  });

  test("timeline tab shows events", async ({ page }) => {
    await page.goto("/");
    await page.locator("select").selectOption(entityType);
    await page.locator('input[type="text"]').fill(entityId);
    await page.locator("button", { hasText: "Inspect" }).click();

    await expect(page.locator('[data-testid="state-json"]')).toBeVisible({
      timeout: 10_000,
    });

    await page.locator("button", { hasText: "Timeline" }).click();

    await expect(page.locator("text=3 events")).toBeVisible({ timeout: 5_000 });
  });
});
