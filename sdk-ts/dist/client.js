"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatisClient = void 0;
const crypto_1 = require("crypto");
const types_1 = require("./types");
class StatisClient {
    constructor(options = {}) {
        const apiKey = options.api_key ?? process.env["STATIS_API_KEY"] ?? "";
        this.baseUrl = (options.base_url ?? "https://api.statis.dev").replace(/\/$/, "");
        this.headers = {
            "Content-Type": "application/json",
            "X-API-Key": apiKey,
        };
        this.defaultTimeout = options.timeout ?? 30;
        this.defaultPollInterval = options.poll_interval ?? 0.5;
    }
    // ---------------------------------------------------------------------------
    // Public API
    // ---------------------------------------------------------------------------
    /** Propose an action and return the action_id. */
    async propose(options) {
        const body = {
            action_id: options.action_id ?? `statis-${(0, crypto_1.randomUUID)()}`,
            action_type: options.action_type,
            target_entity: options.target,
            parameters: options.parameters,
            proposed_by: options.agent_id,
            target_system: options.target_system,
            context: options.context ?? {},
        };
        const data = await this._post("/actions", body);
        return data.action_id;
    }
    /**
     * Propose, evaluate, wait for execution, and return the Receipt.
     *
     * @throws {ActionDeniedError} if the policy engine denies the action
     * @throws {ActionEscalatedError} if the action requires human review
     * @throws {ActionTimeoutError} if execution doesn't complete within timeout
     */
    async execute(options) {
        const aid = await this.propose(options);
        await this._post(`/actions/${aid}/evaluate`, undefined);
        const timeout = options.timeout ?? this.defaultTimeout;
        const pollInterval = options.poll_interval ?? this.defaultPollInterval;
        const deadline = Date.now() + timeout * 1000;
        while (true) {
            const data = await this._get(`/actions/${aid}`);
            const status = data.status;
            if (status === "DENIED") {
                const receipt = await this.getReceipt(aid);
                throw new types_1.ActionDeniedError(receipt);
            }
            if (status === "ESCALATED") {
                throw new types_1.ActionEscalatedError(aid);
            }
            if (status === "COMPLETED" || status === "FAILED") {
                return this.getReceipt(aid);
            }
            if (Date.now() >= deadline) {
                throw new types_1.ActionTimeoutError(aid, timeout);
            }
            await sleep(pollInterval * 1000);
        }
    }
    /** Dry-run policy evaluation. No DB writes, no receipt. */
    async simulate(options) {
        const body = {
            action_type: options.action_type,
            entity_state: options.entity_state ?? {},
            parameters: options.parameters ?? {},
            context: options.context ?? {},
        };
        const data = await this._post("/actions/simulate", body);
        return {
            decision: data["decision"],
            rule_id: data["rule_id"] ?? null,
            rule_version: data["rule_version"] ?? null,
            reason: data["reason"],
        };
    }
    /** Return the current status string for an action (e.g. 'ESCALATED', 'COMPLETED'). */
    async getActionStatus(action_id) {
        const data = await this._get(`/actions/${action_id}`);
        return data.status;
    }
    /** Fetch the receipt for a completed (or denied) action. */
    async getReceipt(action_id) {
        const data = await this._get(`/receipts/${action_id}`);
        return parseReceipt(data);
    }
    // ---------------------------------------------------------------------------
    // HTTP helpers
    // ---------------------------------------------------------------------------
    async _get(path) {
        const resp = await fetch(`${this.baseUrl}${path}`, { headers: this.headers });
        return this._handleResponse(resp);
    }
    async _post(path, body) {
        const resp = await fetch(`${this.baseUrl}${path}`, {
            method: "POST",
            headers: this.headers,
            body: body !== undefined ? JSON.stringify(body) : undefined,
        });
        return this._handleResponse(resp);
    }
    async _handleResponse(resp) {
        if (!resp.ok) {
            let message;
            try {
                const json = (await resp.json());
                message = json["detail"] ?? resp.statusText;
            }
            catch {
                message = resp.statusText;
            }
            throw new types_1.StatisError(resp.status, message);
        }
        return resp.json();
    }
}
exports.StatisClient = StatisClient;
// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
function parseReceipt(data) {
    return {
        receipt_id: data["receipt_id"],
        action_id: data["action_id"],
        decision: data["decision"],
        rule_id: data["rule_id"] ?? null,
        rule_version: data["rule_version"] ?? null,
        approved_by: data["approved_by"],
        conditions_evaluated: data["conditions_evaluated"] ?? null,
        execution_result: data["execution_result"] ?? null,
        executed_at: data["executed_at"] ? new Date(data["executed_at"]) : null,
        hash: data["hash"],
        created_at: new Date(data["created_at"]),
    };
}
//# sourceMappingURL=client.js.map