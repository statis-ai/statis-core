import { ExecuteOptions, ProposeOptions, Receipt } from "./types";
export declare class StatisClient {
    private readonly baseUrl;
    private readonly headers;
    private readonly defaultTimeout;
    private readonly defaultPollInterval;
    constructor(options?: {
        api_key?: string;
        base_url?: string;
        timeout?: number;
        poll_interval?: number;
    });
    /** Propose an action and return the action_id. */
    propose(options: ProposeOptions): Promise<string>;
    /**
     * Propose, evaluate, wait for execution, and return the Receipt.
     *
     * @throws {ActionDeniedError} if the policy engine denies the action
     * @throws {ActionEscalatedError} if the action requires human review
     * @throws {ActionTimeoutError} if execution doesn't complete within timeout
     */
    execute(options: ExecuteOptions): Promise<Receipt>;
    /** Return the current status string for an action (e.g. 'ESCALATED', 'COMPLETED'). */
    getActionStatus(action_id: string): Promise<string>;
    /** Fetch the receipt for a completed (or denied) action. */
    getReceipt(action_id: string): Promise<Receipt>;
    private _get;
    private _post;
    private _handleResponse;
}
//# sourceMappingURL=client.d.ts.map