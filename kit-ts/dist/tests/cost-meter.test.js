"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = require("node:test");
const strict_1 = __importDefault(require("node:assert/strict"));
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const cost_meter_1 = require("../cost-meter");
const FIXTURES = (0, node_path_1.join)(__dirname, "..", "..", "..", "kit", "tests", "fixtures");
function loadMessages(name) {
    const raw = JSON.parse((0, node_fs_1.readFileSync)((0, node_path_1.join)(FIXTURES, name), "utf-8"));
    return raw.map((d) => ({
        role: d.role,
        content: d.content ?? "",
    }));
}
(0, node_test_1.describe)("CostMeter", () => {
    (0, node_test_1.it)("counts messages and returns totals", () => {
        const msgs = loadMessages("transcript_basic.json");
        const meter = new cost_meter_1.CostMeter();
        const { total, perTurn } = meter.countMessages(msgs);
        strict_1.default.ok(total > 0);
        strict_1.default.equal(perTurn.length, msgs.length);
        const sum = perTurn.reduce((acc, tc) => acc + tc.tokens, 0);
        strict_1.default.equal(sum, total);
    });
    (0, node_test_1.it)("per-turn has correct roles", () => {
        const msgs = loadMessages("transcript_basic.json");
        const meter = new cost_meter_1.CostMeter();
        const { perTurn } = meter.countMessages(msgs);
        for (let i = 0; i < perTurn.length; i++) {
            strict_1.default.equal(perTurn[i].turn_index, i);
            strict_1.default.equal(perTurn[i].role, msgs[i].role);
        }
    });
    (0, node_test_1.it)("estimates cost for gpt-4o", () => {
        const meter = new cost_meter_1.CostMeter({ model: "gpt-4o" });
        const est = meter.estimateCost(1000, 500);
        strict_1.default.ok(Math.abs(est.input_cost_usd - 0.0025) < 1e-6);
        strict_1.default.ok(Math.abs(est.output_cost_usd - 0.005) < 1e-6);
        strict_1.default.ok(Math.abs(est.total_cost_usd - 0.0075) < 1e-6);
        strict_1.default.equal(est.model, "gpt-4o");
    });
    (0, node_test_1.it)("estimates cost for claude-sonnet", () => {
        const meter = new cost_meter_1.CostMeter({ model: "claude-sonnet-4-20250514" });
        const est = meter.estimateCost(1000, 500);
        strict_1.default.ok(Math.abs(est.input_cost_usd - 0.003) < 1e-6);
        strict_1.default.ok(Math.abs(est.output_cost_usd - 0.0075) < 1e-6);
    });
    (0, node_test_1.it)("falls back for unknown model", () => {
        const meter = new cost_meter_1.CostMeter({ model: "unknown-model-xyz" });
        const est = meter.estimateCost(1000);
        strict_1.default.ok(Math.abs(est.input_cost_usd - 0.0025) < 1e-6);
    });
    (0, node_test_1.it)("fires on_turn callback", () => {
        const fired = [];
        const meter = new cost_meter_1.CostMeter({ on_turn: (tc) => fired.push(tc) });
        const msgs = [
            { role: "user", content: "Hello world" },
            { role: "assistant", content: "Hi there" },
        ];
        meter.countMessages(msgs);
        strict_1.default.equal(fired.length, 2);
        strict_1.default.equal(fired[0].role, "user");
        strict_1.default.equal(fired[1].role, "assistant");
    });
    (0, node_test_1.it)("countTokens returns positive for non-empty text", () => {
        const meter = new cost_meter_1.CostMeter();
        strict_1.default.ok(meter.countTokens("Hello world") > 0);
    });
});
//# sourceMappingURL=cost-meter.test.js.map