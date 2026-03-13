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
}
export interface ProposeOptions {
    action_type: string;
    target: {
        entity_type: string;
        entity_id: string;
    };
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
export declare class StatisError extends Error {
    readonly status_code: number;
    readonly message: string;
    constructor(status_code: number, message: string);
}
/** Raised by execute() when the policy engine denies the action. */
export declare class ActionDeniedError extends Error {
    readonly receipt: Receipt;
    constructor(receipt: Receipt);
}
/** Raised by execute() when the action is escalated for human review. */
export declare class ActionEscalatedError extends Error {
    readonly action_id: string;
    constructor(action_id: string);
}
/** Raised by execute() when execution doesn't complete within the timeout. */
export declare class ActionTimeoutError extends Error {
    readonly action_id: string;
    readonly timeout: number;
    constructor(action_id: string, timeout: number);
}
//# sourceMappingURL=types.d.ts.map