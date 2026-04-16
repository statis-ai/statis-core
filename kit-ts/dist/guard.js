"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Guard = exports.GuardHaltError = void 0;
const patterns_1 = require("./patterns");
class GuardHaltError extends Error {
    constructor(detections) {
        super(`Guard halted: ${detections.length} injection(s) detected`);
        this.name = "GuardHaltError";
        this.detections = detections;
    }
}
exports.GuardHaltError = GuardHaltError;
class Guard {
    constructor(config) {
        const cfg = config ?? {};
        this.onDetect = cfg.on_detect ?? "strip";
        const disabled = new Set(cfg.disabled_categories ?? []);
        const raw = [];
        for (const p of patterns_1.BUILTIN_PATTERNS) {
            if (!disabled.has(p.category))
                raw.push(p);
        }
        for (const p of cfg.extra_patterns ?? []) {
            if (!disabled.has(p.category))
                raw.push(p);
        }
        this.patterns = raw.map((p) => ({
            id: p.id,
            category: p.category,
            regex: new RegExp(p.pattern, p.flags ?? "gim"),
        }));
    }
    scan(messages) {
        const detections = [];
        const cleaned = [];
        for (let i = 0; i < messages.length; i++) {
            const msg = messages[i];
            if (msg.role !== "user" && msg.role !== "tool") {
                cleaned.push(msg);
                continue;
            }
            const msgDetections = [];
            const content = msg.content;
            for (const pat of this.patterns) {
                // Reset lastIndex for global regex
                pat.regex.lastIndex = 0;
                let match;
                while ((match = pat.regex.exec(content)) !== null) {
                    msgDetections.push({
                        turn_index: i,
                        pattern_id: pat.id,
                        category: pat.category,
                        matched_text: match[0],
                        action_taken: this.onDetect,
                    });
                }
            }
            if (msgDetections.length > 0) {
                detections.push(...msgDetections);
                if (this.onDetect === "halt") {
                    throw new GuardHaltError(detections);
                }
                let stripped = content;
                for (const det of msgDetections) {
                    stripped = stripped.split(det.matched_text).join("");
                }
                stripped = stripped.replace(/\s{2,}/g, " ").trim();
                cleaned.push({ ...msg, content: stripped });
            }
            else {
                cleaned.push(msg);
            }
        }
        return {
            clean: detections.length === 0,
            detections,
            messages: cleaned,
        };
    }
}
exports.Guard = Guard;
//# sourceMappingURL=guard.js.map