import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { CostMeter } from "../cost-meter";
import type { Message, TurnCost } from "../types";

const FIXTURES = join(__dirname, "..", "..", "..", "kit", "tests", "fixtures");

function loadMessages(name: string): Message[] {
  const raw = JSON.parse(readFileSync(join(FIXTURES, name), "utf-8"));
  return raw.map((d: Record<string, unknown>) => ({
    role: d.role as string,
    content: (d.content as string) ?? "",
  }));
}

describe("CostMeter", () => {
  it("counts messages and returns totals", () => {
    const msgs = loadMessages("transcript_basic.json");
    const meter = new CostMeter();
    const { total, perTurn } = meter.countMessages(msgs);
    assert.ok(total > 0);
    assert.equal(perTurn.length, msgs.length);
    const sum = perTurn.reduce((acc, tc) => acc + tc.tokens, 0);
    assert.equal(sum, total);
  });

  it("per-turn has correct roles", () => {
    const msgs = loadMessages("transcript_basic.json");
    const meter = new CostMeter();
    const { perTurn } = meter.countMessages(msgs);
    for (let i = 0; i < perTurn.length; i++) {
      assert.equal(perTurn[i].turn_index, i);
      assert.equal(perTurn[i].role, msgs[i].role);
    }
  });

  it("estimates cost for gpt-4o", () => {
    const meter = new CostMeter({ model: "gpt-4o" });
    const est = meter.estimateCost(1000, 500);
    assert.ok(Math.abs(est.input_cost_usd - 0.0025) < 1e-6);
    assert.ok(Math.abs(est.output_cost_usd - 0.005) < 1e-6);
    assert.ok(Math.abs(est.total_cost_usd - 0.0075) < 1e-6);
    assert.equal(est.model, "gpt-4o");
  });

  it("estimates cost for claude-sonnet", () => {
    const meter = new CostMeter({ model: "claude-sonnet-4-20250514" });
    const est = meter.estimateCost(1000, 500);
    assert.ok(Math.abs(est.input_cost_usd - 0.003) < 1e-6);
    assert.ok(Math.abs(est.output_cost_usd - 0.0075) < 1e-6);
  });

  it("falls back for unknown model", () => {
    const meter = new CostMeter({ model: "unknown-model-xyz" });
    const est = meter.estimateCost(1000);
    assert.ok(Math.abs(est.input_cost_usd - 0.0025) < 1e-6);
  });

  it("fires on_turn callback", () => {
    const fired: TurnCost[] = [];
    const meter = new CostMeter({ on_turn: (tc) => fired.push(tc) });
    const msgs: Message[] = [
      { role: "user", content: "Hello world" },
      { role: "assistant", content: "Hi there" },
    ];
    meter.countMessages(msgs);
    assert.equal(fired.length, 2);
    assert.equal(fired[0].role, "user");
    assert.equal(fired[1].role, "assistant");
  });

  it("countTokens returns positive for non-empty text", () => {
    const meter = new CostMeter();
    assert.ok(meter.countTokens("Hello world") > 0);
  });
});
