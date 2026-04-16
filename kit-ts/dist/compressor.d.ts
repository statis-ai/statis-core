import type { CompressorConfig, Message, SummarizerFn } from "./types";
export declare class Compressor {
    private readonly pinTop;
    private readonly recentTurns;
    private readonly pruneOlderThan;
    private readonly pruneIfSuperseded;
    private readonly summarizer?;
    constructor(config?: CompressorConfig, summarizer?: SummarizerFn);
    process(messages: Message[]): {
        messages: Message[];
        compressedRanges: [number, number][];
    };
    private classify;
    private markSuperseded;
    private summarize;
    private prune;
}
//# sourceMappingURL=compressor.d.ts.map