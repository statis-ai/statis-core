export interface Message {
    role: string;
    content: string;
    name?: string;
    tool_call_id?: string;
    metadata?: Record<string, unknown>;
}
export type Bucket = "pinned" | "recent" | "compressible" | "prunable";
export interface ClassifiedMessage {
    message: Message;
    index: number;
    bucket: Bucket;
}
export interface CostEstimate {
    input_cost_usd: number;
    output_cost_usd: number;
    total_cost_usd: number;
    model: string;
}
export interface TurnCost {
    turn_index: number;
    role: string;
    tokens: number;
    cost_usd: number;
}
export interface GuardDetection {
    turn_index: number;
    pattern_id: string;
    category: string;
    matched_text: string;
    action_taken: string;
}
export interface Report {
    original_tokens: number;
    processed_tokens: number;
    token_delta: number;
    cost_estimate: CostEstimate | null;
    per_turn_costs: TurnCost[];
    guard_detections: GuardDetection[];
    compressed_ranges: [number, number][];
    stripped_payloads: number[];
}
export interface ProcessedContext {
    messages: Message[];
    report: Report;
}
export interface CompressorConfig {
    pin_top?: number;
    recent_turns?: number;
    summary_max_tokens?: number;
    prune_older_than_turns?: number;
    prune_if_superseded?: boolean;
}
export interface MeterConfig {
    model?: string;
    pricing_path?: string;
    on_turn?: (cost: TurnCost) => void;
}
export interface GuardConfig {
    on_detect?: "strip" | "halt";
    extra_patterns?: PatternDef[];
    disabled_categories?: string[];
}
export interface PatternDef {
    id: string;
    category: string;
    pattern: string;
    flags?: string;
}
export type SummarizerFn = (text: string) => string;
export interface KitConfig {
    compressor?: CompressorConfig;
    meter?: MeterConfig;
    guard?: GuardConfig;
    summarizer?: SummarizerFn;
}
export interface GuardResult {
    clean: boolean;
    detections: GuardDetection[];
    messages: Message[];
}
export interface ModelPricing {
    input_per_1k: number;
    output_per_1k: number;
}
export interface PricingTable {
    version: string;
    models: Record<string, ModelPricing>;
}
//# sourceMappingURL=types.d.ts.map