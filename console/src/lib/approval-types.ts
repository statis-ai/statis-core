/**
 * TypeScript mirror of the locked Pydantic 6-shape contract from
 * `api/app/schemas/approval.py`. Lane 3a/3b consume this; do NOT extend or
 * modify the discriminator field set without updating the spine.
 *
 * Discriminator: `shape` (string enum). Switch on it before reading any
 * other field — INVALID_SIG_ERROR deliberately omits action_id (D20).
 */

export const ApprovalShape = {
  PENDING: "PENDING",
  DECISION_RECEIPT: "DECISION_RECEIPT",
  EXPIRED_ERROR: "EXPIRED_ERROR",
  INVALID_SIG_ERROR: "INVALID_SIG_ERROR",
  ROTATED_ERROR: "ROTATED_ERROR",
  ALREADY_DECIDED_RACE: "ALREADY_DECIDED_RACE",
} as const;

export type ApprovalShapeT = (typeof ApprovalShape)[keyof typeof ApprovalShape];

export interface AgentIdentitySnapshot {
  handle: string;
  version?: string | null;
  spawned_by?: string | null;
  actions_today: number;
  denied_today: number;
  agent_class?: string | null;
  org_unit?: string | null;
  trust_source?: string | null;
}

export interface ActionSnapshot {
  action_id: string;
  tenant_id: string;
  action_type: string;
  target_system: string;
  target_entity: Record<string, unknown>;
  parameters: Record<string, unknown>;
  proposed_at: string; // ISO-8601
  expires_at: string; // ISO-8601 — token expiry, NOT action expiry
  agent: AgentIdentitySnapshot;
}

export interface PendingResponse {
  shape: typeof ApprovalShape.PENDING;
  action: ActionSnapshot;
}

export interface DecisionReceipt {
  shape: typeof ApprovalShape.DECISION_RECEIPT;
  action_id: string;
  decision: "APPROVED" | "DENIED";
  decided_at: string;
  decided_by?: string | null;
  receipt_id: string;
  receipt_url: string;
  signature_alg: string;
  public_key_id: string;
}

export interface ExpiredError {
  shape: typeof ApprovalShape.EXPIRED_ERROR;
  action_id: string;
  expired_at: string;
  recovery_hint: string;
}

export interface InvalidSigError {
  shape: typeof ApprovalShape.INVALID_SIG_ERROR;
  detail: string;
}

export interface RotatedError {
  shape: typeof ApprovalShape.ROTATED_ERROR;
  tenant_id: string;
  rotated_at: string;
  detail: string;
}

export interface AlreadyDecidedRace {
  shape: typeof ApprovalShape.ALREADY_DECIDED_RACE;
  action_id: string;
  decision: "APPROVED" | "DENIED";
  decided_at: string;
  decided_by?: string | null;
  receipt_url: string;
}

export type ApprovalGetResponse =
  | PendingResponse
  | ExpiredError
  | InvalidSigError
  | RotatedError
  | AlreadyDecidedRace;

export type ApprovalDecisionResponse =
  | DecisionReceipt
  | ExpiredError
  | InvalidSigError
  | RotatedError
  | AlreadyDecidedRace;

export interface DecisionRequestBody {
  decision: "APPROVED" | "DENIED";
  csrf_token: string;
  decided_by?: string;
  deny_reason?: string;
}

/* ------------------------------------------------------------------ */
/* Receipts page                                                       */
/* ------------------------------------------------------------------ */

export interface PublicReceipt {
  receipt_id: string;
  action_id: string;
  tenant_id: string;
  decision: "APPROVED" | "DENIED" | string;
  rule_id?: string | null;
  rule_version?: string | null;
  approved_by: string;
  conditions_evaluated?: Record<string, unknown> | null;
  execution_result?: Record<string, unknown> | null;
  executed_at?: string | null;
  hash: string;
  created_at: string;
  signature?: string | null;
  signature_alg?: string | null;
  public_key_id?: string | null;
}

/**
 * D17 / D21 — verification result rendered as a banner.
 * Server validates signature and returns one of these states.
 * v1 ships SIGNATURE_VERIFIED · ED25519 only — no chain badge (OV-T3).
 */
export type ReceiptVerification =
  | { state: "VERIFIED"; signature_alg: string; public_key_id: string }
  | { state: "FAILED"; signature_alg: string; public_key_id: string; check: string }
  | { state: "UNSIGNED" }; // legacy receipts predating PR-AARM-02

export interface PublicReceiptResponse {
  receipt: PublicReceipt;
  verification: ReceiptVerification;
}

/* ------------------------------------------------------------------ */
/* Graduation lookup (GET /actions/{id}/similar)                       */
/* ------------------------------------------------------------------ */

export interface SimilarApproval {
  action_id: string;
  decided_at: string;
  decided_by?: string | null;
  decision: "APPROVED" | "DENIED";
}

export interface GraduatedRuleRef {
  rule_id: string;
  graduated_from_action_id?: string | null;
  created_at: string; // ISO-8601
}

export interface SimilarApprovalsResponse {
  count: number;
  window_seconds: number;
  approvals: SimilarApproval[];
  // Populated when services/graduation has already drafted a rule for this
  // shape. AuditPanel renders an inline "Rule auto-drafted" line below the
  // prior-approvals list when this is non-null.
  graduated_rule?: GraduatedRuleRef | null;
}
