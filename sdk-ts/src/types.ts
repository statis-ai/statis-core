export interface Receipt {
  receipt_id: string;
  action_id: string;
  decision: string;
  rule_id: string | null;
  rule_version: string | null;
  approved_by: string;
  conditions_evaluated: Record<string, unknown> | null;
  execution_result: Record<string, unknown> | null;
  executed_at: Date | null;
  hash: string;
  created_at: Date;
  // AARM R5 — Ed25519 signature fields. null on legacy receipts that
  // predate PR-AARM-02; populated on everything signed after that.
  signature: string | null;
  signature_alg: string | null;
  public_key_id: string | null;
}

export interface AARMPubkeyEnvelope {
  v: number;
  spec: string;
  active: string;
  keys: Array<{
    kid: string;
    alg: string;
    public_key_pem: string;
  }>;
}

export interface SimulateOptions {
  action_type: string;
  entity_state?: Record<string, unknown>;
  parameters?: Record<string, unknown>;
  context?: Record<string, unknown>;
}

export interface SimulateResult {
  decision: string;
  rule_id: string | null;
  rule_version: string | null;
  reason: string;
}

export interface ProposeOptions {
  action_type: string;
  target: { entity_type: string; entity_id: string };
  parameters: Record<string, unknown>;
  agent_id: string;
  target_system: string;
  action_id?: string;
  context?: Record<string, unknown>;
}

export interface ExecuteOptions extends ProposeOptions {
  timeout?: number;
  poll_interval?: number;
}

/** Raised when the Statis API returns a non-2xx response. */
export class StatisError extends Error {
  readonly status_code: number;
  readonly message: string;

  constructor(status_code: number, message: string) {
    super(`HTTP ${status_code}: ${message}`);
    this.name = "StatisError";
    this.status_code = status_code;
    this.message = message;
  }
}

/** Raised by execute() when the policy engine denies the action. */
export class ActionDeniedError extends Error {
  readonly receipt: Receipt;

  constructor(receipt: Receipt) {
    super(`Action denied by policy`);
    this.name = "ActionDeniedError";
    this.receipt = receipt;
  }
}

/** Raised by execute() when the action is escalated for human review. */
export class ActionEscalatedError extends Error {
  readonly action_id: string;

  constructor(action_id: string) {
    super(`Action '${action_id}' was escalated and requires human review`);
    this.name = "ActionEscalatedError";
    this.action_id = action_id;
  }
}

/** Raised by execute() when execution doesn't complete within the timeout. */
export class ActionTimeoutError extends Error {
  readonly action_id: string;
  readonly timeout: number;

  constructor(action_id: string, timeout: number) {
    super(`Action '${action_id}' did not complete within ${timeout}s`);
    this.name = "ActionTimeoutError";
    this.action_id = action_id;
    this.timeout = timeout;
  }
}

/**
 * Raised when the policy engine defers an action (AARM R4 DEFER).
 *
 * A deferred action is not yet decided — the engine suspended execution
 * because available context was insufficient, ambiguous, or conflicting.
 * Full resolution workflow (poll until resolved) lands in PR-AARM-05.
 */
export class ActionDeferredError extends Error {
  readonly action_id: string;
  readonly reason: string | null;

  constructor(action_id: string, reason: string | null = null) {
    super(`Action '${action_id}' was deferred: ${reason ?? "awaiting resolution"}`);
    this.name = "ActionDeferredError";
    this.action_id = action_id;
    this.reason = reason;
  }
}
