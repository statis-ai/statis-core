const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export interface EntityState {
  entity_type: string;
  entity_id: string;
  state: Record<string, unknown>;
  state_version: number;
  state_hash: string | null;
  last_event_id: string | null;
  provenance: string[];
}

export interface EventRecord {
  event_id: string;
  entity_type: string;
  entity_id: string;
  event_type: string;
  payload: Record<string, unknown>;
  occurred_at: string;
  ingested_at: string;
  producer: string;
  schema_version: string;
  trace_id: string | null;
}

export interface DeliveryRecord {
  delivery_id: string;
  subscription_id: string;
  entity_type: string;
  entity_id: string;
  state_version: number;
  dedupe_key: string;
  status: string;
  attempt_count: number;
  next_attempt_at: string;
  last_error: string | null;
  sent_at: string | null;
  response_code: number | null;
  created_at: string;
}

export interface ActionContract {
  action_id: string;
  proposed_by: string;
  action_type: string;
  target_entity: Record<string, string>;
  target_system: string;
  parameters: Record<string, unknown>;
  context: Record<string, unknown>;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface ConditionResult {
  label: string;
  passed: boolean;
  expected?: unknown;
  actual?: unknown;
  threshold?: number;
  days?: number;
  actual_last_discount?: string | null;
}

export interface ReceiptDetail {
  receipt_id: string;
  action_id: string;
  decision: string;
  rule_id: string | null;
  rule_version: string | null;
  approved_by: string;
  executed_at: string | null;
  execution_result: Record<string, unknown> | null;
  hash: string;
  conditions_evaluated: Record<string, ConditionResult> | null;
  entity_state_snapshot: Record<string, unknown> | null;
  created_at: string;
}

async function json<T>(url: string): Promise<T> {
  const apiKey =
    (typeof window !== "undefined" && localStorage.getItem("statis_api_key")) ||
    process.env.NEXT_PUBLIC_API_KEY ||
    "";
  const res = await fetch(url, {
    headers: {
      "X-API-Key": apiKey,
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API ${res.status}: ${body}`);
  }
  return res.json() as Promise<T>;
}

export function fetchState(
  entityType: string,
  entityId: string,
): Promise<EntityState> {
  return json<EntityState>(`${BASE}/state/${entityType}/${entityId}`);
}

export function fetchStateAtRev(
  entityType: string,
  entityId: string,
  rev: number,
): Promise<EntityState> {
  return json<EntityState>(
    `${BASE}/state/${entityType}/${entityId}/at?rev=${rev}`,
  );
}

export function fetchEvents(
  entityType: string,
  entityId: string,
): Promise<EventRecord[]> {
  return json<EventRecord[]>(
    `${BASE}/events?entity_type=${entityType}&entity_id=${entityId}`,
  );
}

export function fetchDeliveries(
  entityType: string,
  entityId: string,
): Promise<DeliveryRecord[]> {
  return json<DeliveryRecord[]>(
    `${BASE}/deliveries?entity_type=${entityType}&entity_id=${entityId}`,
  );
}

export function fetchActions(
  entityType: string,
  entityId: string,
): Promise<ActionContract[]> {
  return json<ActionContract[]>(
    `${BASE}/actions?entity_type=${entityType}&entity_id=${entityId}`,
  );
}

export function fetchReceipt(actionId: string): Promise<ReceiptDetail> {
  return json<ReceiptDetail>(`${BASE}/receipts/${actionId}`);
}
