"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = require("node:test");
const strict_1 = __importDefault(require("node:assert/strict"));
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const index_1 = require("../index");
const FIXTURES = (0, node_path_1.join)(__dirname, "..", "..", "..", "kit", "tests", "fixtures");
function loadRaw(name) {
    return JSON.parse((0, node_fs_1.readFileSync)((0, node_path_1.join)(FIXTURES, name), "utf-8"));
}
(0, node_test_1.describe)("process() — unified entry point", () => {
    (0, node_test_1.it)("processes basic transcript", () => {
        const msgs = loadRaw("transcript_basic.json");
        const result = (0, index_1.process)(msgs);
        strict_1.default.ok(result.messages.length > 0);
        strict_1.default.ok(result.report.original_tokens > 0);
        strict_1.default.ok(result.report.processed_tokens > 0);
        strict_1.default.ok(result.report.cost_estimate !== null);
    });
    (0, node_test_1.it)("detects injections in injection transcript", () => {
        const msgs = loadRaw("transcript_injection.json");
        const result = (0, index_1.process)(msgs);
        strict_1.default.ok(result.report.guard_detections.length > 0);
        strict_1.default.ok(result.report.stripped_payloads.length > 0);
    });
    (0, node_test_1.it)("compresses with compressor config", () => {
        const msgs = loadRaw("transcript_long.json");
        const result = (0, index_1.process)(msgs, {
            compressor: { pin_top: 1, recent_turns: 4, prune_older_than_turns: 5 },
        });
        strict_1.default.ok(result.messages.length < msgs.length);
        strict_1.default.ok(result.report.token_delta > 0);
        strict_1.default.ok(result.report.compressed_ranges.length > 0);
    });
    (0, node_test_1.it)("works with no config", () => {
        const msgs = loadRaw("transcript_basic.json");
        const result = (0, index_1.process)(msgs);
        strict_1.default.equal(result.report.original_tokens, result.report.processed_tokens);
    });
    (0, node_test_1.it)("halt guard throws", () => {
        const msgs = loadRaw("transcript_injection.json");
        strict_1.default.throws(() => (0, index_1.process)(msgs, { guard: { on_detect: "halt" } }), (err) => {
            strict_1.default.ok(err instanceof index_1.GuardHaltError);
            strict_1.default.ok(err.detections.length > 0);
            return true;
        });
    });
});
//# sourceMappingURL=process.test.js.map