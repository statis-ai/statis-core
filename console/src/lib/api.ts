const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// ── Helpers ──────────────────────────────────────────────────

function getApiKey(): string {
  return (
    (typeof window !== "undefined" && localStorage.getItem("statis_api_key")) ||
    process.env.NEXT_PUBLIC_API_KEY ||
    ""
  );
}

async function json<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: { "X-API-Key": getApiKey() },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API ${res.status}: ${body}`);
  }
  return res.json() as Promise<T>;
}

async function post<T>(url: string, body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": getApiKey(),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

async function put<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": getApiKey(),
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

async function del(url: string): Promise<void> {
  const res = await fetch(url, {
    method: "DELETE",
    headers: { "X-API-Key": getApiKey() },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${res.status}: ${text}`);
  }
}

// ── Types ────────────────────────────────────────────────────

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

export interface EscalatedAction {
  action_id: string;
  action_type: string;
  target_entity: Record<string, string>;
  target_system: string;
  proposed_by: string;
  parameters: Record<string, unknown>;
  context: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface PolicyRule {
  rule_id: string;
  rule_version: string;
  action_type: string;
  conditions: Record<string, unknown>;
  decision: string;
  priority: number;
  active: boolean;
  description: string | null;
  created_at: string;
  // Graduation (migration 0045). 'manual' for human-authored rules,
  // 'graduated' for rules auto-drafted by services/graduation.py after
  // 3 approvals of the same canonical_args_hash. graduated rules also
  // expose graduated_from_action_id so the operator can trace the
  // triggering decision.
  source?: "manual" | "graduated";
  canonical_args_hash?: string | null;
  graduated_from_action_id?: string | null;
}

export interface PolicyRuleCreate {
  rule_id: string;
  rule_version?: string;
  action_type: string;
  conditions: Record<string, unknown>;
  decision?: string;
  priority?: number;
  active?: boolean;
  description?: string;
}

export interface PolicyRuleUpdate {
  rule_version?: string;
  action_type?: string;
  conditions?: Record<string, unknown>;
  decision?: string;
  priority?: number;
  active?: boolean;
  description?: string;
}

export interface WebhookRecord {
  id: string;
  url: string;
  events: string[];
  is_active: boolean;
  created_at: string;
}

export interface WebhookCreate {
  url: string;
  events: string[];
}

export interface KillSwitchStatus {
  active: boolean;
  activated_at: string | null;
  activated_by: string | null;
}

export interface ReceiptVerifyResult {
  receipt_id: string;
  hash_valid: boolean;
  stored_hash: string;
  computed_hash: string;
}

export interface ThreatLog {
  id: string;
  action_id: string;
  tenant_id: string;
  threat_types: string[];
  threat_level: "critical" | "high" | "medium" | "low";
  details: string | null;
  scanned_at: string;
}

export interface AdminMe {
  tenant_id: string;
  role: string;
  agent_id: string;
}

// ── Actions ──────────────────────────────────────────────────

export function fetchAllActions(opts?: {
  status?: string;
  limit?: number;
}): Promise<ActionContract[]> {
  const params = new URLSearchParams();
  if (opts?.status) params.set("status", opts.status);
  if (opts?.limit) params.set("limit", String(opts.limit));
  const qs = params.toString();
  return json<ActionContract[]>(`${BASE}/actions${qs ? `?${qs}` : ""}`);
}

export function fetchActions(
  entityType: string,
  entityId: string,
): Promise<ActionContract[]> {
  return json<ActionContract[]>(
    `${BASE}/actions?entity_type=${entityType}&entity_id=${entityId}`,
  );
}

export function fetchAction(actionId: string): Promise<ActionContract> {
  return json<ActionContract>(`${BASE}/actions/${actionId}`);
}

// ── Events ───────────────────────────────────────────────────

export function fetchAllEvents(opts?: {
  limit?: number;
  entityType?: string;
  entityId?: string;
}): Promise<EventRecord[]> {
  const params = new URLSearchParams();
  if (opts?.limit) params.set("limit", String(opts.limit));
  if (opts?.entityType) params.set("entity_type", opts.entityType);
  if (opts?.entityId) params.set("entity_id", opts.entityId);
  const qs = params.toString();
  return json<EventRecord[]>(`${BASE}/events${qs ? `?${qs}` : ""}`);
}

export function fetchEvents(
  entityType: string,
  entityId: string,
): Promise<EventRecord[]> {
  return json<EventRecord[]>(
    `${BASE}/events?entity_type=${entityType}&entity_id=${entityId}`,
  );
}

// ── State ────────────────────────────────────────────────────

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

// ── Receipts ─────────────────────────────────────────────────

export function fetchReceipt(actionId: string): Promise<ReceiptDetail> {
  return json<ReceiptDetail>(`${BASE}/receipts/${actionId}`);
}

export function verifyReceipt(receiptId: string): Promise<ReceiptVerifyResult> {
  return json<ReceiptVerifyResult>(`${BASE}/receipts/${receiptId}/verify`);
}

// ── Deliveries ───────────────────────────────────────────────

export function fetchDeliveries(
  entityType: string,
  entityId: string,
): Promise<DeliveryRecord[]> {
  return json<DeliveryRecord[]>(
    `${BASE}/deliveries?entity_type=${entityType}&entity_id=${entityId}`,
  );
}

// ── Policy Rules ─────────────────────────────────────────────

export function fetchPolicyRules(actionType?: string): Promise<PolicyRule[]> {
  const qs = actionType ? `?action_type=${actionType}` : "";
  return json<PolicyRule[]>(`${BASE}/policy-rules${qs}`);
}

export function createPolicyRule(rule: PolicyRuleCreate): Promise<PolicyRule> {
  return post<PolicyRule>(`${BASE}/policy-rules`, rule);
}

export function updatePolicyRule(
  ruleId: string,
  update: PolicyRuleUpdate,
): Promise<PolicyRule> {
  return put<PolicyRule>(`${BASE}/policy-rules/${ruleId}`, update);
}

export function deletePolicyRule(ruleId: string): Promise<void> {
  return del(`${BASE}/policy-rules/${ruleId}`);
}

// ── Escalations ──────────────────────────────────────────────

export function fetchEscalations(): Promise<EscalatedAction[]> {
  return json<EscalatedAction[]>(`${BASE}/escalations`);
}

export function approveEscalation(
  actionId: string,
  reviewerId: string,
  note?: string,
): Promise<ActionContract> {
  return post<ActionContract>(`${BASE}/actions/${actionId}/approve`, {
    reviewer_id: reviewerId,
    note: note ?? null,
  });
}

export function rejectEscalation(
  actionId: string,
  reviewerId: string,
  note?: string,
): Promise<ActionContract> {
  return post<ActionContract>(`${BASE}/actions/${actionId}/reject`, {
    reviewer_id: reviewerId,
    note: note ?? null,
  });
}

// ── Webhooks ─────────────────────────────────────────────────

export function fetchWebhooks(): Promise<WebhookRecord[]> {
  return json<WebhookRecord[]>(`${BASE}/webhooks`);
}

export function createWebhook(webhook: WebhookCreate): Promise<WebhookRecord> {
  return post<WebhookRecord>(`${BASE}/webhooks`, webhook);
}

export function deleteWebhook(webhookId: string): Promise<void> {
  return del(`${BASE}/webhooks/${webhookId}`);
}

// ── Kill Switch ──────────────────────────────────────────────

export function fetchKillSwitchStatus(): Promise<KillSwitchStatus> {
  return json<KillSwitchStatus>(`${BASE}/kill-switch/status`);
}

export function activateKillSwitch(): Promise<KillSwitchStatus> {
  return post<KillSwitchStatus>(`${BASE}/kill-switch/activate`);
}

export function deactivateKillSwitch(): Promise<KillSwitchStatus> {
  return post<KillSwitchStatus>(`${BASE}/kill-switch/deactivate`);
}

// ── Threat Logs ──────────────────────────────────────────────

export function fetchThreatLogs(opts?: {
  limit?: number;
  offset?: number;
  threat_level?: string;
}): Promise<ThreatLog[]> {
  const params = new URLSearchParams();
  if (opts?.limit) params.set("limit", String(opts.limit));
  if (opts?.offset) params.set("offset", String(opts.offset));
  if (opts?.threat_level) params.set("threat_level", opts.threat_level);
  const qs = params.toString() ? `?${params.toString()}` : "";
  return json<ThreatLog[]>(`${BASE}/threat-logs${qs}`);
}

// ── Analytics ────────────────────────────────────────────────

export interface RuleStat {
  rule_id: string;
  fires: number;
  decision: string;
}

export interface AgentStat {
  agent_id: string;
  actions: number;
}

export interface DailyBucket {
  date: string;
  approved: number;
  denied: number;
  escalated: number;
}

export interface AnalyticsSummary {
  period_days: number;
  actions_total: number;
  actions_approved: number;
  actions_denied: number;
  actions_escalated: number;
  approval_rate: number;
  top_rules: RuleStat[];
  top_agents: AgentStat[];
  daily_trend: DailyBucket[];
}

export function fetchAnalyticsSummary(days = 7): Promise<AnalyticsSummary> {
  return json<AnalyticsSummary>(`${BASE}/analytics/summary?days=${days}`);
}

export interface SimulateResult {
  decision: string;
  rule_id: string | null;
  rule_version: string | null;
  reason: string;
}

// ── Agents ───────────────────────────────────────────────────

export interface RegisteredAgent {
  agent_id: string;
  tenant_id: string;
  name: string;
  allowed_action_types: string[];
  rate_limit_per_hour: number | null;
  is_active: boolean;
  created_at: string;
}

export function fetchRegisteredAgents(): Promise<RegisteredAgent[]> {
  return json<RegisteredAgent[]>(`${BASE}/agents`);
}

export function registerAgent(body: {
  agent_id: string;
  name: string;
  allowed_action_types?: string[];
  rate_limit_per_hour?: number | null;
}): Promise<RegisteredAgent> {
  return post<RegisteredAgent>(`${BASE}/agents`, body);
}

export function updateAgent(
  agentId: string,
  body: {
    name?: string;
    allowed_action_types?: string[];
    is_active?: boolean;
  }
): Promise<RegisteredAgent> {
  return put<RegisteredAgent>(`${BASE}/agents/${agentId}`, body);
}

export function deactivateAgent(agentId: string): Promise<void> {
  return del(`${BASE}/agents/${agentId}`);
}

export function simulateAction(body: {
  action_type: string;
  entity_state?: Record<string, unknown>;
  parameters?: Record<string, unknown>;
}): Promise<SimulateResult> {
  return post<SimulateResult>(`${BASE}/actions/simulate`, body);
}

// ── Admin ────────────────────────────────────────────────────

export function fetchAdminMe(): Promise<AdminMe> {
  return json<AdminMe>(`${BASE}/admin/me`);
}
