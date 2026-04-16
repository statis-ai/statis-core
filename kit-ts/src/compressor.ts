import type { Bucket, ClassifiedMessage, CompressorConfig, Message, SummarizerFn } from "./types";

const CORRECTION_PATTERNS = [
  /^(?:actually|correction|sorry|wait|no,)\b/i,
  /\b(?:instead|rather|update|revised|changed? (?:to|my))\b/i,
];

const DEFAULTS: Required<CompressorConfig> = {
  pin_top: 1,
  recent_turns: 4,
  summary_max_tokens: 200,
  prune_older_than_turns: 20,
  prune_if_superseded: true,
};

export class Compressor {
  private readonly pinTop: number;
  private readonly recentTurns: number;
  private readonly pruneOlderThan: number;
  private readonly pruneIfSuperseded: boolean;
  private readonly summarizer?: SummarizerFn;

  constructor(config?: CompressorConfig, summarizer?: SummarizerFn) {
    const cfg = { ...DEFAULTS, ...config };
    this.pinTop = cfg.pin_top;
    this.recentTurns = cfg.recent_turns;
    this.pruneOlderThan = cfg.prune_older_than_turns;
    this.pruneIfSuperseded = cfg.prune_if_superseded;
    this.summarizer = summarizer;
  }

  process(messages: Message[]): { messages: Message[]; compressedRanges: [number, number][] } {
    let classified = this.classify(messages);
    classified = this.summarize(classified);
    return this.prune(classified);
  }

  private classify(messages: Message[]): ClassifiedMessage[] {
    const n = messages.length;
    let turnCount = 0;
    let recentBoundary = this.pinTop;

    for (let i = n - 1; i >= 0; i--) {
      if (messages[i].role === "user" || messages[i].role === "assistant") {
        turnCount++;
        if (turnCount >= this.recentTurns * 2) {
          recentBoundary = i;
          break;
        }
      }
    }

    const classified: ClassifiedMessage[] = [];

    for (let i = 0; i < n; i++) {
      let bucket: Bucket;
      if (i < this.pinTop) {
        bucket = "pinned";
      } else if (i >= recentBoundary) {
        bucket = "recent";
      } else {
        let turnsFromStart = 0;
        for (let j = 0; j <= i; j++) {
          if (messages[j].role === "user" || messages[j].role === "assistant") {
            turnsFromStart++;
          }
        }
        turnsFromStart = Math.floor(turnsFromStart / 2);
        bucket = turnsFromStart > this.pruneOlderThan ? "prunable" : "compressible";
      }

      classified.push({ message: messages[i], index: i, bucket });
    }

    if (this.pruneIfSuperseded) {
      this.markSuperseded(classified);
    }

    return classified;
  }

  private markSuperseded(classified: ClassifiedMessage[]): void {
    const toolResults: Map<string, number> = new Map();

    for (const cm of classified) {
      if (cm.message.role === "tool" && cm.message.name) {
        const prev = toolResults.get(cm.message.name);
        if (prev !== undefined && classified[prev].bucket === "compressible") {
          classified[prev] = { ...classified[prev], bucket: "prunable" };
        }
        toolResults.set(cm.message.name, cm.index);
      }
    }

    for (const cm of classified) {
      if (cm.bucket !== "compressible" || cm.message.role !== "user") continue;
      const isCorrection = CORRECTION_PATTERNS.some((p) => p.test(cm.message.content));
      if (!isCorrection) continue;

      for (let j = cm.index - 1; j >= 0; j--) {
        if (classified[j].message.role === "user" && classified[j].bucket === "compressible") {
          classified[j] = { ...classified[j], bucket: "prunable" };
          break;
        }
      }
    }
  }

  private summarize(classified: ClassifiedMessage[]): ClassifiedMessage[] {
    if (!this.summarizer) {
      return classified.map((cm) => ({
        ...cm,
        bucket: cm.bucket === "compressible" ? ("prunable" as Bucket) : cm.bucket,
      }));
    }

    const result: ClassifiedMessage[] = [];
    let i = 0;

    while (i < classified.length) {
      if (classified[i].bucket !== "compressible") {
        result.push(classified[i]);
        i++;
        continue;
      }

      const block: ClassifiedMessage[] = [];
      while (i < classified.length && classified[i].bucket === "compressible") {
        block.push(classified[i]);
        i++;
      }

      const text = block.map((m) => `[${m.message.role}]: ${m.message.content}`).join("\n");

      try {
        const summary = this.summarizer(text);
        result.push({
          message: {
            role: "assistant",
            content: `[Summary of turns ${block[0].index}-${block[block.length - 1].index}]: ${summary}`,
            metadata: { statis_kit_summary: true },
          },
          index: block[0].index,
          bucket: "recent",
        });
      } catch {
        result.push(...block);
      }
    }

    return result;
  }

  private prune(classified: ClassifiedMessage[]): { messages: Message[]; compressedRanges: [number, number][] } {
    const output: Message[] = [];
    const compressedRanges: [number, number][] = [];
    let pruneStart: number | null = null;

    for (const cm of classified) {
      if (cm.bucket === "prunable") {
        if (pruneStart === null) pruneStart = cm.index;
      } else {
        if (pruneStart !== null) {
          compressedRanges.push([pruneStart, cm.index - 1]);
          pruneStart = null;
        }
        output.push(cm.message);
      }
    }

    if (pruneStart !== null && classified.length > 0) {
      compressedRanges.push([pruneStart, classified[classified.length - 1].index]);
    }

    return { messages: output, compressedRanges };
  }
}
