import { BUILTIN_PATTERNS } from "./patterns";
import type { GuardConfig, GuardDetection, GuardResult, Message, PatternDef } from "./types";

export class GuardHaltError extends Error {
  detections: GuardDetection[];
  constructor(detections: GuardDetection[]) {
    super(`Guard halted: ${detections.length} injection(s) detected`);
    this.name = "GuardHaltError";
    this.detections = detections;
  }
}

interface CompiledPattern {
  id: string;
  category: string;
  regex: RegExp;
}

export class Guard {
  private readonly onDetect: "strip" | "halt";
  private readonly patterns: CompiledPattern[];

  constructor(config?: GuardConfig) {
    const cfg = config ?? {};
    this.onDetect = cfg.on_detect ?? "strip";
    const disabled = new Set(cfg.disabled_categories ?? []);

    const raw: PatternDef[] = [];
    for (const p of BUILTIN_PATTERNS) {
      if (!disabled.has(p.category)) raw.push(p);
    }
    for (const p of cfg.extra_patterns ?? []) {
      if (!disabled.has(p.category)) raw.push(p);
    }

    this.patterns = raw.map((p) => ({
      id: p.id,
      category: p.category,
      regex: new RegExp(p.pattern, p.flags ?? "gim"),
    }));
  }

  scan(messages: Message[]): GuardResult {
    const detections: GuardDetection[] = [];
    const cleaned: Message[] = [];

    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];

      if (msg.role !== "user" && msg.role !== "tool") {
        cleaned.push(msg);
        continue;
      }

      const msgDetections: GuardDetection[] = [];
      const content = msg.content;

      for (const pat of this.patterns) {
        // Reset lastIndex for global regex
        pat.regex.lastIndex = 0;
        let match: RegExpExecArray | null;
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
      } else {
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
