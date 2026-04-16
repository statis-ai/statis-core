"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = require("node:test");
const strict_1 = __importDefault(require("node:assert/strict"));
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const compressor_1 = require("../compressor");
const FIXTURES = (0, node_path_1.join)(__dirname, "..", "..", "..", "kit", "tests", "fixtures");
function loadMessages(name) {
    const raw = JSON.parse((0, node_fs_1.readFileSync)((0, node_path_1.join)(FIXTURES, name), "utf-8"));
    return raw.map((d) => ({
        role: d.role,
        content: d.content ?? "",
        name: d.name,
        tool_call_id: d.tool_call_id,
    }));
}
(0, node_test_1.describe)("Compressor — basic", () => {
    (0, node_test_1.it)("short transcript passes through unchanged", () => {
        const msgs = loadMessages("transcript_basic.json");
        const comp = new compressor_1.Compressor({ pin_top: 1, recent_turns: 10 });
        const { messages, compressedRanges } = comp.process(msgs);
        strict_1.default.equal(messages.length, msgs.length);
        strict_1.default.deepEqual(compressedRanges, []);
    });
    (0, node_test_1.it)("pinned messages are preserved", () => {
        const msgs = loadMessages("transcript_long.json");
        const comp = new compressor_1.Compressor({ pin_top: 1, recent_turns: 4 });
        const { messages } = comp.process(msgs);
        strict_1.default.equal(messages[0].role, "system");
        strict_1.default.ok(messages[0].content.toLowerCase().includes("project management"));
    });
    (0, node_test_1.it)("compression reduces message count", () => {
        const msgs = loadMessages("transcript_long.json");
        const comp = new compressor_1.Compressor({ pin_top: 1, recent_turns: 4, prune_older_than_turns: 5 });
        const { messages, compressedRanges } = comp.process(msgs);
        strict_1.default.ok(messages.length < msgs.length);
        strict_1.default.ok(compressedRanges.length > 0);
    });
    (0, node_test_1.it)("recent turns are preserved", () => {
        const msgs = loadMessages("transcript_long.json");
        const comp = new compressor_1.Compressor({ pin_top: 1, recent_turns: 4 });
        const { messages } = comp.process(msgs);
        strict_1.default.equal(messages[messages.length - 1].content, msgs[msgs.length - 1].content);
    });
});
(0, node_test_1.describe)("Compressor — with summarizer", () => {
    (0, node_test_1.it)("calls summarizer for compressible blocks", () => {
        const msgs = loadMessages("transcript_long.json");
        const calls = [];
        const summarizer = (text) => {
            calls.push(text);
            return "Summarized content.";
        };
        const comp = new compressor_1.Compressor({ pin_top: 1, recent_turns: 2, prune_older_than_turns: 50 }, summarizer);
        const { messages } = comp.process(msgs);
        strict_1.default.ok(calls.length > 0);
        const summaries = messages.filter((m) => m.metadata?.statis_kit_summary);
        strict_1.default.ok(summaries.length > 0);
    });
    (0, node_test_1.it)("keeps originals on summarizer failure", () => {
        const msgs = loadMessages("transcript_long.json");
        const summarizer = () => { throw new Error("LLM failed"); };
        const comp = new compressor_1.Compressor({ pin_top: 1, recent_turns: 2, prune_older_than_turns: 50 }, summarizer);
        const { messages } = comp.process(msgs);
        strict_1.default.ok(messages.length > 0);
    });
});
(0, node_test_1.describe)("Compressor — superseded", () => {
    (0, node_test_1.it)("prunes repeated tool calls", () => {
        const msgs = [
            { role: "system", content: "You are helpful." },
            { role: "user", content: "Check my balance." },
            { role: "tool", content: '{"balance": 100}', name: "get_balance", tool_call_id: "c1" },
            { role: "assistant", content: "Your balance is $100." },
            { role: "user", content: "Check again." },
            { role: "tool", content: '{"balance": 150}', name: "get_balance", tool_call_id: "c2" },
            { role: "assistant", content: "Your balance is now $150." },
            { role: "user", content: "Thanks." },
            { role: "assistant", content: "You're welcome!" },
        ];
        const comp = new compressor_1.Compressor({ pin_top: 1, recent_turns: 2, prune_older_than_turns: 50, prune_if_superseded: true });
        const { messages } = comp.process(msgs);
        const toolResults = messages.filter((m) => m.role === "tool");
        strict_1.default.ok(toolResults.length <= 1);
    });
    (0, node_test_1.it)("prunes corrected messages", () => {
        const msgs = [
            { role: "system", content: "You are helpful." },
            { role: "user", content: "Set the color to red." },
            { role: "assistant", content: "Done, color is red." },
            { role: "user", content: "Actually, set it to blue instead." },
            { role: "assistant", content: "Done, color is blue." },
            { role: "user", content: "Perfect, thanks." },
            { role: "assistant", content: "You're welcome!" },
        ];
        const comp = new compressor_1.Compressor({ pin_top: 1, recent_turns: 2, prune_older_than_turns: 50, prune_if_superseded: true });
        const { messages } = comp.process(msgs);
        strict_1.default.ok(!messages.some((m) => m.content.includes("Set the color to red")));
    });
});
(0, node_test_1.describe)("Compressor — edge cases", () => {
    (0, node_test_1.it)("handles empty messages", () => {
        const comp = new compressor_1.Compressor();
        const { messages, compressedRanges } = comp.process([]);
        strict_1.default.deepEqual(messages, []);
        strict_1.default.deepEqual(compressedRanges, []);
    });
    (0, node_test_1.it)("handles single message", () => {
        const comp = new compressor_1.Compressor();
        const { messages, compressedRanges } = comp.process([{ role: "system", content: "Hello" }]);
        strict_1.default.equal(messages.length, 1);
        strict_1.default.deepEqual(compressedRanges, []);
    });
});
//# sourceMappingURL=compressor.test.js.map