export type { Message, ProcessedContext, Report, CostEstimate, TurnCost, GuardDetection, GuardResult, KitConfig, CompressorConfig, MeterConfig, GuardConfig, Bucket, ClassifiedMessage, SummarizerFn, PatternDef, } from "./types";
export { Guard, GuardHaltError } from "./guard";
export { CostMeter } from "./cost-meter";
export { Compressor } from "./compressor";
import type { KitConfig, Message, ProcessedContext } from "./types";
export declare function process(messages: Message[], config?: KitConfig): ProcessedContext;
//# sourceMappingURL=index.d.ts.map