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

async function json<T>(url: string): Promise<T> {
  const apiKey = process.env.NEXT_PUBLIC_API_KEY || "test_key_123";
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
