export { StatisClient } from "./client";
export {
  Receipt,
  ProposeOptions,
  ExecuteOptions,
  StatisError,
  ActionDeniedError,
  ActionEscalatedError,
  ActionDeferredError,
  ActionTimeoutError,
} from "./types";

// Re-export statis-kit context processing (offline, zero-auth)
export {
  process as processContext,
  GuardHaltError,
} from "statis-kit";
export type {
  KitConfig,
  CompressorConfig,
  MeterConfig,
  GuardConfig,
  ProcessedContext,
  Report,
  Message as KitMessage,
  CostEstimate,
  TurnCost,
  GuardDetection,
} from "statis-kit";
