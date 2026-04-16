import type { GuardConfig, GuardDetection, GuardResult, Message } from "./types";
export declare class GuardHaltError extends Error {
    detections: GuardDetection[];
    constructor(detections: GuardDetection[]);
}
export declare class Guard {
    private readonly onDetect;
    private readonly patterns;
    constructor(config?: GuardConfig);
    scan(messages: Message[]): GuardResult;
}
//# sourceMappingURL=guard.d.ts.map