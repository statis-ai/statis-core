import type { CostEstimate, MeterConfig, Message, TurnCost } from "./types";
export declare class CostMeter {
    private readonly model;
    private readonly pricing;
    private readonly onTurn?;
    private readonly counter;
    constructor(config?: MeterConfig);
    countTokens(text: string): number;
    countMessages(messages: Message[]): {
        total: number;
        perTurn: TurnCost[];
    };
    estimateCost(inputTokens: number, outputTokens?: number): CostEstimate;
}
//# sourceMappingURL=cost-meter.d.ts.map