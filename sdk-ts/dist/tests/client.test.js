"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = require("node:test");
const strict_1 = __importDefault(require("node:assert/strict"));
const index_1 = require("../index");
const BASE = "https://api.statis.dev";
const RECEIPT_PAYLOAD = {
    receipt_id: "rcpt-1",
    action_id: "act-1",
    decision: "APPROVED",
    rule_id: "churn_retention_v1",
    rule_version: "1",
    approved_by: "policy_engine",
    conditions_evaluated: { churn_risk: { label: "Churn Risk", passed: true } },
    execution_result: { status: "ok" },
    executed_at: "2024-01-01T00:00:01+00:00",
    hash: "abc123",
    created_at: "2024-01-01T00:00:00+00:00",
};
const ACTION_PROPOSED = {
    action_id: "act-1",
    status: "PROPOSED",
    proposed_by: "agent-x",
    action_type: "retention_offer",
    target_entity: { entity_type: "account", entity_id: "acct-1" },
    target_system: "stripe",
    parameters: {},
    context: {},
    created_at: "2024-01-01T00:00:00+00:00",
    updated_at: "2024-01-01T00:00:00+00:00",
};
function makeResponse(status, body) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json" },
    });
}
// ---------------------------------------------------------------------------
// propose()
// ---------------------------------------------------------------------------
(0, node_test_1.describe)("propose()", () => {
    (0, node_test_1.it)("returns action_id from API", async () => {
        const fetchMock = node_test_1.mock.fn(async (_url) => makeResponse(201, ACTION_PROPOSED));
        node_test_1.mock.method(globalThis, "fetch", fetchMock);
        const client = new index_1.StatisClient({ api_key: "test-key", base_url: BASE });
        const aid = await client.propose({
            action_type: "retention_offer",
            target: { entity_type: "account", entity_id: "acct-1" },
            parameters: {},
            agent_id: "agent-x",
            target_system: "stripe",
            action_id: "act-1",
        });
        strict_1.default.equal(aid, "act-1");
        node_test_1.mock.restoreAll();
    });
    (0, node_test_1.it)("sends provided action_id and maps agent_id to proposed_by", async () => {
        let capturedBody = {};
        const fetchMock = node_test_1.mock.fn(async (_url, opts) => {
            capturedBody = JSON.parse(opts.body);
            return makeResponse(201, ACTION_PROPOSED);
        });
        node_test_1.mock.method(globalThis, "fetch", fetchMock);
        const client = new index_1.StatisClient({ api_key: "k", base_url: BASE });
        await client.propose({
            action_type: "retention_offer",
            target: { entity_type: "account", entity_id: "acct-1" },
            parameters: {},
            agent_id: "agent-x",
            target_system: "stripe",
            action_id: "act-1",
        });
        strict_1.default.equal(capturedBody["action_id"], "act-1");
        strict_1.default.equal(capturedBody["proposed_by"], "agent-x");
        node_test_1.mock.restoreAll();
    });
    (0, node_test_1.it)("auto-generates action_id prefixed with statis-", async () => {
        let capturedBody = {};
        const fetchMock = node_test_1.mock.fn(async (_url, opts) => {
            capturedBody = JSON.parse(opts.body);
            return makeResponse(201, { ...ACTION_PROPOSED, action_id: capturedBody["action_id"] });
        });
        node_test_1.mock.method(globalThis, "fetch", fetchMock);
        const client = new index_1.StatisClient({ api_key: "k", base_url: BASE });
        const aid = await client.propose({
            action_type: "retention_offer",
            target: { entity_type: "account", entity_id: "acct-1" },
            parameters: {},
            agent_id: "agent-x",
            target_system: "stripe",
        });
        strict_1.default.ok(aid.startsWith("statis-"));
        node_test_1.mock.restoreAll();
    });
    (0, node_test_1.it)("throws StatisError on 4xx", async () => {
        const fetchMock = node_test_1.mock.fn(async () => makeResponse(409, { detail: "already exists" }));
        node_test_1.mock.method(globalThis, "fetch", fetchMock);
        const client = new index_1.StatisClient({ api_key: "k", base_url: BASE });
        await strict_1.default.rejects(() => client.propose({
            action_type: "retention_offer",
            target: { entity_type: "account", entity_id: "acct-1" },
            parameters: {},
            agent_id: "agent-x",
            target_system: "stripe",
            action_id: "act-1",
        }), (err) => {
            strict_1.default.ok(err instanceof index_1.StatisError);
            strict_1.default.equal(err.status_code, 409);
            strict_1.default.ok(err.message.includes("already exists"));
            return true;
        });
        node_test_1.mock.restoreAll();
    });
});
// ---------------------------------------------------------------------------
// getReceipt()
// ---------------------------------------------------------------------------
(0, node_test_1.describe)("getReceipt()", () => {
    (0, node_test_1.it)("parses all fields correctly", async () => {
        const fetchMock = node_test_1.mock.fn(async () => makeResponse(200, RECEIPT_PAYLOAD));
        node_test_1.mock.method(globalThis, "fetch", fetchMock);
        const client = new index_1.StatisClient({ api_key: "k", base_url: BASE });
        const r = await client.getReceipt("act-1");
        strict_1.default.equal(r.receipt_id, "rcpt-1");
        strict_1.default.equal(r.decision, "APPROVED");
        strict_1.default.equal(r.rule_id, "churn_retention_v1");
        strict_1.default.deepEqual(r.conditions_evaluated, { churn_risk: { label: "Churn Risk", passed: true } });
        strict_1.default.deepEqual(r.execution_result, { status: "ok" });
        strict_1.default.ok(r.executed_at instanceof Date);
        strict_1.default.equal(r.hash, "abc123");
        node_test_1.mock.restoreAll();
    });
    (0, node_test_1.it)("handles null optional fields", async () => {
        const payload = {
            ...RECEIPT_PAYLOAD,
            rule_id: null,
            rule_version: null,
            conditions_evaluated: null,
            execution_result: null,
            executed_at: null,
        };
        const fetchMock = node_test_1.mock.fn(async () => makeResponse(200, payload));
        node_test_1.mock.method(globalThis, "fetch", fetchMock);
        const client = new index_1.StatisClient({ api_key: "k", base_url: BASE });
        const r = await client.getReceipt("act-1");
        strict_1.default.equal(r.rule_id, null);
        strict_1.default.equal(r.conditions_evaluated, null);
        strict_1.default.equal(r.executed_at, null);
        node_test_1.mock.restoreAll();
    });
});
// ---------------------------------------------------------------------------
// execute() — happy path
// ---------------------------------------------------------------------------
(0, node_test_1.describe)("execute()", () => {
    (0, node_test_1.it)("returns receipt on COMPLETED", async () => {
        let callCount = 0;
        const fetchMock = node_test_1.mock.fn(async (url, opts) => {
            const method = opts?.method ?? "GET";
            if (method === "POST" && url.endsWith("/actions")) {
                return makeResponse(201, ACTION_PROPOSED);
            }
            if (method === "POST" && url.includes("/evaluate")) {
                return makeResponse(200, {});
            }
            if (method === "GET" && url.includes("/actions/act-1")) {
                callCount++;
                const status = callCount === 1 ? "EXECUTING" : "COMPLETED";
                return makeResponse(200, { ...ACTION_PROPOSED, status });
            }
            if (method === "GET" && url.includes("/receipts/act-1")) {
                return makeResponse(200, RECEIPT_PAYLOAD);
            }
            return makeResponse(404, {});
        });
        node_test_1.mock.method(globalThis, "fetch", fetchMock);
        const client = new index_1.StatisClient({ api_key: "k", base_url: BASE, poll_interval: 0 });
        const receipt = await client.execute({
            action_type: "retention_offer",
            target: { entity_type: "account", entity_id: "acct-1" },
            parameters: {},
            agent_id: "agent-x",
            target_system: "stripe",
            action_id: "act-1",
        });
        strict_1.default.equal(receipt.decision, "APPROVED");
        node_test_1.mock.restoreAll();
    });
    (0, node_test_1.it)("throws ActionDeniedError on DENIED", async () => {
        const fetchMock = node_test_1.mock.fn(async (url, opts) => {
            const method = opts?.method ?? "GET";
            if (method === "POST" && url.endsWith("/actions"))
                return makeResponse(201, ACTION_PROPOSED);
            if (method === "POST")
                return makeResponse(200, {});
            if (url.includes("/receipts/"))
                return makeResponse(200, { ...RECEIPT_PAYLOAD, decision: "DENIED" });
            return makeResponse(200, { ...ACTION_PROPOSED, status: "DENIED" });
        });
        node_test_1.mock.method(globalThis, "fetch", fetchMock);
        const client = new index_1.StatisClient({ api_key: "k", base_url: BASE, poll_interval: 0 });
        await strict_1.default.rejects(() => client.execute({
            action_type: "retention_offer",
            target: { entity_type: "account", entity_id: "acct-1" },
            parameters: {},
            agent_id: "agent-x",
            target_system: "stripe",
            action_id: "act-1",
        }), (err) => {
            strict_1.default.ok(err instanceof index_1.ActionDeniedError);
            strict_1.default.equal(err.receipt.decision, "DENIED");
            strict_1.default.equal(err.receipt.action_id, "act-1");
            return true;
        });
        node_test_1.mock.restoreAll();
    });
    (0, node_test_1.it)("throws ActionEscalatedError on ESCALATED", async () => {
        const fetchMock = node_test_1.mock.fn(async (url, opts) => {
            const method = opts?.method ?? "GET";
            if (method === "POST" && url.endsWith("/actions"))
                return makeResponse(201, ACTION_PROPOSED);
            if (method === "POST")
                return makeResponse(200, {});
            return makeResponse(200, { ...ACTION_PROPOSED, status: "ESCALATED" });
        });
        node_test_1.mock.method(globalThis, "fetch", fetchMock);
        const client = new index_1.StatisClient({ api_key: "k", base_url: BASE, poll_interval: 0 });
        await strict_1.default.rejects(() => client.execute({
            action_type: "retention_offer",
            target: { entity_type: "account", entity_id: "acct-1" },
            parameters: {},
            agent_id: "agent-x",
            target_system: "stripe",
            action_id: "act-1",
        }), (err) => {
            strict_1.default.ok(err instanceof index_1.ActionEscalatedError);
            strict_1.default.equal(err.action_id, "act-1");
            strict_1.default.ok(err.message.includes("human review"));
            return true;
        });
        node_test_1.mock.restoreAll();
    });
    (0, node_test_1.it)("throws ActionTimeoutError when deadline exceeded", async () => {
        const fetchMock = node_test_1.mock.fn(async (url, opts) => {
            const method = opts?.method ?? "GET";
            if (method === "POST" && url.endsWith("/actions"))
                return makeResponse(201, ACTION_PROPOSED);
            if (method === "POST")
                return makeResponse(200, {});
            return makeResponse(200, { ...ACTION_PROPOSED, status: "EXECUTING" });
        });
        node_test_1.mock.method(globalThis, "fetch", fetchMock);
        const client = new index_1.StatisClient({ api_key: "k", base_url: BASE, poll_interval: 0 });
        await strict_1.default.rejects(() => client.execute({
            action_type: "retention_offer",
            target: { entity_type: "account", entity_id: "acct-1" },
            parameters: {},
            agent_id: "agent-x",
            target_system: "stripe",
            action_id: "act-1",
            timeout: 0.001, // 1ms — will expire immediately
        }), (err) => {
            strict_1.default.ok(err instanceof index_1.ActionTimeoutError);
            strict_1.default.equal(err.action_id, "act-1");
            return true;
        });
        node_test_1.mock.restoreAll();
    });
});
// ---------------------------------------------------------------------------
// getActionStatus()
// ---------------------------------------------------------------------------
(0, node_test_1.describe)("getActionStatus()", () => {
    (0, node_test_1.it)("returns raw status string", async () => {
        const fetchMock = node_test_1.mock.fn(async () => makeResponse(200, { ...ACTION_PROPOSED, status: "ESCALATED" }));
        node_test_1.mock.method(globalThis, "fetch", fetchMock);
        const client = new index_1.StatisClient({ api_key: "k", base_url: BASE });
        const status = await client.getActionStatus("act-1");
        strict_1.default.equal(status, "ESCALATED");
        node_test_1.mock.restoreAll();
    });
});
//# sourceMappingURL=client.test.js.map