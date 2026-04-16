export type {
  Message,
  ProcessedContext,
  Report,
  CostEstimate,
  TurnCost,
  GuardDetection,
  GuardResult,
  KitConfig,
  CompressorConfig,
  MeterConfig,
  GuardConfig,
  Bucket,
  ClassifiedMessage,
  SummarizerFn,
  PatternDef,
} from "./types";

export { Guard, GuardHaltError } from "./guard";
export { CostMeter } from "./cost-meter";
export { Compressor } from "./compressor";

import type { KitConfig, Message, ProcessedContext, Report, GuardDetection } from "./types";
import { Guard } from "./guard";
import { CostMeter } from "./cost-meter";
import { Compressor } from "./compressor";

export function process(
  messages: Message[],
  config?: KitConfig,
): ProcessedContext {
  const cfg = config ?? {};
  let msgs = [...messages];

  let guardDetections: GuardDetection[] = [];
  let strippedPayloads: number[] = [];

  // Phase 1: Guard
  const guard = new Guard(cfg.guard);
  const guardResult = guard.scan(msgs);
  guardDetections = guardResult.detections;
  strippedPayloads = [...new Set(guardDetections.map((d) => d.turn_index))];
  msgs = guardResult.messages;

  // Phase 2: Compressor
  let compressedRanges: [number, number][] = [];
  if (cfg.compressor) {
    const compressor = new Compressor(cfg.compressor, cfg.summarizer);
    const result = compressor.process(msgs);
    msgs = result.messages;
    compressedRanges = result.compressedRanges;
  }

  // Phase 3: Cost Meter
  const meter = new CostMeter(cfg.meter);
  const originalTokens = messages.reduce((sum, m) => sum + meter.countTokens(m.content), 0);
  const { total: processedTokens, perTurn } = meter.countMessages(msgs);
  const costEstimate = meter.estimateCost(processedTokens);

  const report: Report = {
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
