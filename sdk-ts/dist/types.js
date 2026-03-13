"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionTimeoutError = exports.ActionEscalatedError = exports.ActionDeniedError = exports.StatisError = void 0;
/** Raised when the Statis API returns a non-2xx response. */
class StatisError extends Error {
    constructor(status_code, message) {
        super(`HTTP ${status_code}: ${message}`);
        this.name = "StatisError";
        this.status_code = status_code;
        this.message = message;
    }
}
exports.StatisError = StatisError;
/** Raised by execute() when the policy engine denies the action. */
class ActionDeniedError extends Error {
    constructor(receipt) {
        super(`Action denied by policy`);
        this.name = "ActionDeniedError";
        this.receipt = receipt;
    }
}
exports.ActionDeniedError = ActionDeniedError;
/** Raised by execute() when the action is escalated for human review. */
class ActionEscalatedError extends Error {
    constructor(action_id) {
        super(`Action '${action_id}' was escalated and requires human review`);
        this.name = "ActionEscalatedError";
        this.action_id = action_id;
    }
}
exports.ActionEscalatedError = ActionEscalatedError;
/** Raised by execute() when execution doesn't complete within the timeout. */
class ActionTimeoutError extends Error {
    constructor(action_id, timeout) {
        super(`Action '${action_id}' did not complete within ${timeout}s`);
        this.name = "ActionTimeoutError";
        this.action_id = action_id;
        this.timeout = timeout;
    }
}
exports.ActionTimeoutError = ActionTimeoutError;
//# sourceMappingURL=types.js.map