import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { process, GuardHaltError } from "../index";
import type { Message } from "../types";

const FIXTURES = join(__dirname, "..", "..", "..", "kit", "tests", "fixtures");

function loadRaw(name: string): Message[] {
  return JSON.parse(readFileSync(join(FIXTURES, name), "utf-8"));
}

describe("process() — unified entry point", () => {
  it("processes basic transcript", () => {
    const msgs = loadRaw("transcript_basic.json");
    const result = process(msgs);
    assert.ok(result.messages.length > 0);
    assert.ok(result.report.original_tokens > 0);
    assert.ok(result.report.processed_tokens > 0);
    assert.ok(result.report.cost_estimate !== null);
  });

  it("detects injections in injection transcript", () => {
    const msgs = loadRaw("transcript_injection.json");
    const result = process(msgs);
    assert.ok(result.report.guard_detections.length > 0);
    assert.ok(result.report.stripped_payloads.length > 0);
  });

  it("compresses with compressor config", () => {
    const msgs = loadRaw("transcript_long.json");
    const result = process(msgs, {
      compressor: { pin_top: 1, recent_turns: 4, prune_older_than_turns: 5 },
    });
    assert.ok(result.messages.length < msgs.length);
    assert.ok(result.report.token_delta > 0);
    assert.ok(result.report.compressed_ranges.length > 0);
  });

  it("works with no config", () => {
    const msgs = loadRaw("transcript_basic.json");
    const result = process(msgs);
    assert.equal(result.report.original_tokens, result.report.processed_tokens);
  });

  it("halt guard throws", () => {
    const msgs = loadRaw("transcript_injection.json");
    assert.throws(
      () => process(msgs, { guard: { on_detect: "halt" } }),
      (err: unknown) => {
        assert.ok(err instanceof GuardHaltError);
        assert.ok(err.detections.length > 0);
        return true;
      },
    );
  });
});
