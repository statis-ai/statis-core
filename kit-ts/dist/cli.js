#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_fs_1 = require("node:fs");
const cost_meter_1 = require("./cost-meter");
const RESET = "\x1b[0m";
const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";
function loadJson(path) {
    try {
        const data = JSON.parse((0, node_fs_1.readFileSync)(path, "utf-8"));
        if (!Array.isArray(data)) {
            console.error(`Error: ${path} must contain a JSON array of messages.`);
            process.exit(1);
        }
        return data;
    }
    catch (e) {
        console.error(`Error reading ${path}: ${e}`);
        process.exit(1);
    }
}
function truncate(text, maxLen = 80) {
    return text.length <= maxLen ? text : text.slice(0, maxLen - 3) + "...";
}
function diffColored(before, after) {
    const meter = new cost_meter_1.CostMeter();
    const beforeTokens = before.reduce((s, m) => s + meter.countTokens(m.content), 0);
    const afterTokens = after.reduce((s, m) => s + meter.countTokens(m.content), 0);
    const delta = beforeTokens - afterTokens;
    const pct = beforeTokens > 0 ? (delta / beforeTokens) * 100 : 0;
    console.log(`\n${BOLD}Context Diff${RESET}`);
    console.log(`  Before: ${before.length} messages, ${beforeTokens} tokens`);
    console.log(`  After:  ${after.length} messages, ${afterTokens} tokens`);
    if (delta > 0) {
        console.log(`  Delta:  ${GREEN}-${delta} tokens (${pct.toFixed(1)}% reduction)${RESET}`);
    }
    else if (delta < 0) {
        console.log(`  Delta:  ${RED}+${-delta} tokens (${(-pct).toFixed(1)}% increase)${RESET}`);
    }
    else {
        console.log(`  Delta:  ${DIM}no change${RESET}`);
    }
    console.log();
    const beforeSet = new Set(before.map((m) => `${m.role}::${m.content}`));
    const afterSet = new Set(after.map((m) => `${m.role}::${m.content}`));
    for (const m of before) {
        const key = `${m.role}::${m.content}`;
        if (!afterSet.has(key)) {
            console.log(`  ${RED}- [${m.role}] ${truncate(m.content)}${RESET}`);
        }
        else {
            console.log(`  ${DIM}  [${m.role}] ${truncate(m.content)}${RESET}`);
        }
    }
    for (const m of after) {
        const key = `${m.role}::${m.content}`;
        if (!beforeSet.has(key)) {
            console.log(`  ${GREEN}+ [${m.role}] ${truncate(m.content)}${RESET}`);
        }
    }
    console.log();
}
function diffJson(before, after) {
    const meter = new cost_meter_1.CostMeter();
    const beforeTokens = before.reduce((s, m) => s + meter.countTokens(m.content), 0);
    const afterTokens = after.reduce((s, m) => s + meter.countTokens(m.content), 0);
    const beforeSet = new Set(before.map((m) => `${m.role}::${m.content}`));
    const afterSet = new Set(after.map((m) => `${m.role}::${m.content}`));
    const removed = before
        .filter((m) => !afterSet.has(`${m.role}::${m.content}`))
        .map((m) => ({ role: m.role, content: m.content }));
    const added = after
        .filter((m) => !beforeSet.has(`${m.role}::${m.content}`))
        .map((m) => ({ role: m.role, content: m.content }));
    console.log(JSON.stringify({
        before_messages: before.length,
        after_messages: after.length,
        before_tokens: beforeTokens,
        after_tokens: afterTokens,
        token_delta: beforeTokens - afterTokens,
        removed,
        added,
    }, null, 2));
}
function main() {
    const args = process.argv.slice(2);
    if (args.length === 0 || args[0] === "--help" || args[0] === "-h") {
        console.log("Usage: statis-kit diff <before.json> <after.json> [--json]");
        process.exit(0);
    }
    if (args[0] === "diff") {
        if (args.length < 3) {
            console.error("Usage: statis-kit diff <before.json> <after.json> [--json]");
            process.exit(1);
        }
        const before = loadJson(args[1]);
        const after = loadJson(args[2]);
        const jsonMode = args.includes("--json");
        if (jsonMode) {
            diffJson(before, after);
        }
        else {
            diffColored(before, after);
        }
    }
    else {
        console.error(`Unknown command: ${args[0]}`);
        process.exit(1);
    }
}
main();
//# sourceMappingURL=cli.js.map