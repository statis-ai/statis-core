import type { CostEstimate, MeterConfig, Message, ModelPricing, PricingTable, TurnCost } from "./types";
import DEFAULT_PRICING from "../data/pricing.json";

function loadPricing(path?: string): PricingTable {
  if (path === undefined) {
    return DEFAULT_PRICING as PricingTable;
  }
  // Custom path — Node-only. Dynamic require keeps browser bundles clean.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { readFileSync } = require("node:fs");
  return JSON.parse(readFileSync(path, "utf-8")) as PricingTable;
}

function getModelPricing(model: string, pricing?: PricingTable): ModelPricing {
  const table = pricing ?? loadPricing();
  const models = table.models;

  if (model in models) return models[model];

  // Bidirectional prefix match — matches both dated→short and short→dated forms
  for (const key of Object.keys(models)) {
    if (model.startsWith(key) || key.startsWith(model)) return models[key];
  }

  // Default to gpt-4o
  return models["gpt-4o"] ?? { input_per_1k: 0.0025, output_per_1k: 0.01 };
}

function countTokensFallback(text: string): number {
  return Math.max(1, Math.floor(text.length / 4));
}

export class CostMeter {
  private readonly model: string;
  private readonly pricing: PricingTable;
  private readonly onTurn?: (cost: TurnCost) => void;
  private readonly counter: (text: string) => number;

  constructor(config?: MeterConfig) {
    const cfg = config ?? {};
    this.model = cfg.model ?? "gpt-4o";
    this.pricing = loadPricing(cfg.pricing_path);
    this.onTurn = cfg.on_turn;
    this.counter = countTokensFallback;
  }

  countTokens(text: string): number {
    return this.counter(text);
  }

  countMessages(messages: Message[]): { total: number; perTurn: TurnCost[] } {
    const { input_per_1k } = getModelPricing(this.model, this.pricing);
    const perTurn: TurnCost[] = [];
    let total = 0;

    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      const tokens = this.counter(msg.content);
      const cost_usd = (tokens / 1000) * input_per_1k;
      const tc: TurnCost = { turn_index: i, role: msg.role, tokens, cost_usd };
      perTurn.push(tc);
      total += tokens;
      this.onTurn?.(tc);
    }

    return { total, perTurn };
  }

  estimateCost(inputTokens: number, outputTokens: number = 0): CostEstimate {
    const pricing = getModelPricing(this.model, this.pricing);
    const inputCost = (inputTokens / 1000) * pricing.input_per_1k;
    const outputCost = (outputTokens / 1000) * pricing.output_per_1k;
    return {
      input_cost_usd: parseFloat(inputCost.toFixed(8)),
      output_cost_usd: parseFloat(outputCost.toFixed(8)),
      total_cost_usd: parseFloat((inputCost + outputCost).toFixed(8)),
      model: this.model,
    };
  }
}
