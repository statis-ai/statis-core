"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Compressor = exports.CostMeter = exports.GuardHaltError = exports.Guard = void 0;
exports.process = process;
var guard_1 = require("./guard");
Object.defineProperty(exports, "Guard", { enumerable: true, get: function () { return guard_1.Guard; } });
Object.defineProperty(exports, "GuardHaltError", { enumerable: true, get: function () { return guard_1.GuardHaltError; } });
var cost_meter_1 = require("./cost-meter");
Object.defineProperty(exports, "CostMeter", { enumerable: true, get: function () { return cost_meter_1.CostMeter; } });
var compressor_1 = require("./compressor");
Object.defineProperty(exports, "Compressor", { enumerable: true, get: function () { return compressor_1.Compressor; } });
const guard_2 = require("./guard");
const cost_meter_2 = require("./cost-meter");
const compressor_2 = require("./compressor");
function process(messages, config) {
    const cfg = config ?? {};
    let msgs = [...messages];
    let guardDetections = [];
    let strippedPayloads = [];
    // Phase 1: Guard
    const guard = new guard_2.Guard(cfg.guard);
    const guardResult = guard.scan(msgs);
    guardDetections = guardResult.detections;
    strippedPayloads = [...new Set(guardDetections.map((d) => d.turn_index))];
    msgs = guardResult.messages;
    // Phase 2: Compressor
    let compressedRanges = [];
    if (cfg.compressor) {
        const compressor = new compressor_2.Compressor(cfg.compressor, cfg.summarizer);
        const result = compressor.process(msgs);
        msgs = result.messages;
        compressedRanges = result.compressedRanges;
    }
    // Phase 3: Cost Meter
    const meter = new cost_meter_2.CostMeter(cfg.meter);
    const originalTokens = messages.reduce((sum, m) => sum + meter.countTokens(m.content), 0);
    const { total: processedTokens, perTurn } = meter.countMessages(msgs);
    const costEstimate = meter.estimateCost(processedTokens);
    const report = {
        original_tokens: originalTokens,
        processed_tokens: processedTokens,
        token_delta: originalTokens - processedTokens,
        cost_estimate: costEstimate,
        per_turn_costs: perTurn,
        guard_detections: guardDetections,
        compressed_ranges: compressedRanges,
        stripped_payloads: strippedPayloads,
    };
    return { messages: msgs, report };
}
//# sourceMappingURL=index.js.map