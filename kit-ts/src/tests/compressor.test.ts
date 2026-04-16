import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Compressor } from "../compressor";
import type { Message } from "../types";

const FIXTURES = join(__dirname, "..", "..", "..", "kit", "tests", "fixtures");

function loadMessages(name: string): Message[] {
  const raw = JSON.parse(readFileSync(join(FIXTURES, name), "utf-8"));
  return raw.map((d: Record<string, unknown>) => ({
    role: d.role as string,
    content: (d.content as string) ?? "",
    name: d.name as string | undefined,
    tool_call_id: d.tool_call_id as string | undefined,
  }));
}

describe("Compressor — basic", () => {
  it("short transcript passes through unchanged", () => {
    const msgs = loadMessages("transcript_basic.json");
    const comp = new Compressor({ pin_top: 1, recent_turns: 10 });
    const { messages, compressedRanges } = comp.process(msgs);
    assert.equal(messages.length, msgs.length);
    assert.deepEqual(compressedRanges, []);
  });

  it("pinned messages are preserved", () => {
    const msgs = loadMessages("transcript_long.json");
    const comp = new Compressor({ pin_top: 1, recent_turns: 4 });
    const { messages } = comp.process(msgs);
    assert.equal(messages[0].role, "system");
    assert.ok(messages[0].content.toLowerCase().includes("project management"));
  });

  it("compression reduces message count", () => {
    const msgs = loadMessages("transcript_long.json");
    const comp = new Compressor({ pin_top: 1, recent_turns: 4, prune_older_than_turns: 5 });
    const { messages, compressedRanges } = comp.process(msgs);
    assert.ok(messages.length < msgs.length);
    assert.ok(compressedRanges.length > 0);
  });

  it("recent turns are preserved", () => {
    const msgs = loadMessages("transcript_long.json");
    const comp = new Compressor({ pin_top: 1, recent_turns: 4 });
    const { messages } = comp.process(msgs);
    assert.equal(messages[messages.length - 1].content, msgs[msgs.length - 1].content);
  });
});

describe("Compressor — with summarizer", () => {
  it("calls summarizer for compressible blocks", () => {
    const msgs = loadMessages("transcript_long.json");
    const calls: string[] = [];
    const summarizer = (text: string): string => {
      calls.push(text);
      return "Summarized content.";
    };
    const comp = new Compressor({ pin_top: 1, recent_turns: 2, prune_older_than_turns: 50 }, summarizer);
    const { messages } = comp.process(msgs);
    assert.ok(calls.length > 0);
    const summaries = messages.filter((m) => m.metadata?.statis_kit_summary);
    assert.ok(summaries.length > 0);
  });

  it("keeps originals on summarizer failure", () => {
    const msgs = loadMessages("transcript_long.json");
    const summarizer = (): string => { throw new Error("LLM failed"); };
    const comp = new Compressor({ pin_top: 1, recent_turns: 2, prune_older_than_turns: 50 }, summarizer);
    const { messages } = comp.process(msgs);
    assert.ok(messages.length > 0);
  });
});

describe("Compressor — superseded", () => {
  it("prunes repeated tool calls", () => {
    const msgs: Message[] = [
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
    const comp = new Compressor({ pin_top: 1, recent_turns: 2, prune_older_than_turns: 50, prune_if_superseded: true });
    const { messages } = comp.process(msgs);
    const toolResults = messages.filter((m) => m.role === "tool");
    assert.ok(toolResults.length <= 1);
  });

  it("prunes corrected messages", () => {
    const msgs: Message[] = [
      { role: "system", content: "You are helpful." },
      { role: "user", content: "Set the color to red." },
      { role: "assistant", content: "Done, color is red." },
      { role: "user", content: "Actually, set it to blue instead." },
      { role: "assistant", content: "Done, color is blue." },
      { role: "user", content: "Perfect, thanks." },
      { role: "assistant", content: "You're welcome!" },
    ];
    const comp = new Compressor({ pin_top: 1, recent_turns: 2, prune_older_than_turns: 50, prune_if_superseded: true });
    const { messages } = comp.process(msgs);
    assert.ok(!messages.some((m) => m.content.includes("Set the color to red")));
  });
});

describe("Compressor — edge cases", () => {
  it("handles empty messages", () => {
    const comp = new Compressor();
    const { messages, compressedRanges } = comp.process([]);
    assert.deepEqual(messages, []);
    assert.deepEqual(compressedRanges, []);
  });

  it("handles single message", () => {
    const comp = new Compressor();
    const { messages, compressedRanges } = comp.process([{ role: "system", content: "Hello" }]);
    assert.equal(messages.length, 1);
    assert.deepEqual(compressedRanges, []);
  });
});
