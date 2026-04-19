export { StatisClient } from "./client";
export {
  Receipt,
  AARMPubkeyEnvelope,
  ProposeOptions,
  ExecuteOptions,
  StatisError,
  ActionDeniedError,
  ActionEscalatedError,
  ActionDeferredError,
  ActionTimeoutError,
} from "./types";
export { verifyReceiptOffline } from "./crypto";
export type { VerifyResult } from "./crypto";

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
