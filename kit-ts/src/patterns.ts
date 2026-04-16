import type { PatternDef } from "./types";

export const BUILTIN_PATTERNS: PatternDef[] = [
  // instruction_override
  {
    id: "io_ignore_previous",
    category: "instruction_override",
    pattern: "(?:ignore|disregard|forget|override|bypass)\\s+(?:all\\s+)?(?:previous|above|prior|earlier|preceding)\\s+(?:instructions?|prompts?|rules?|guidelines?|directives?|context)",
  },
  {
    id: "io_new_instructions",
    category: "instruction_override",
    pattern: "(?:new|updated|revised|replacement)\\s+(?:system\\s+)?(?:instructions?|prompt|directive|task|role)\\s*[:.\\-]",
  },
  {
    id: "io_you_are_now",
    category: "instruction_override",
    pattern: "you\\s+are\\s+now\\s+(?:a|an|the|my)\\s+\\w+",
  },
  {
    id: "io_do_not_follow",
    category: "instruction_override",
    pattern: "(?:do\\s+not|don'?t|stop)\\s+follow(?:ing)?\\s+(?:your|the|any)\\s+(?:previous|original|initial|system)\\s+(?:instructions?|rules?|guidelines?|prompt)",
  },
  {
    id: "io_jailbreak_keywords",
    category: "instruction_override",
    pattern: "(?:DAN|STAN|DUDE|AIM)\\s+mode|(?:developer|maintenance|god|sudo|root)\\s+mode|jailbreak",
  },
  // authority_impersonation
  {
    id: "ai_system_prefix",
    category: "authority_impersonation",
    pattern: "^(?:SYSTEM|ADMIN|DEVELOPER|OPERATOR|ENGINEER(?:ING)?)\\s*:\\s*",
  },
  {
    id: "ai_authorization_code",
    category: "authority_impersonation",
    pattern: "(?:authorization|auth|access)\\s+(?:code|token|key)\\s*:\\s*\\S+",
  },
  {
    id: "ai_im_the_developer",
    category: "authority_impersonation",
    pattern: "(?:i\\s+am|i'm)\\s+(?:the|your|a)\\s+(?:developer|admin(?:istrator)?|system\\s+admin|operator|engineer|owner|creator)",
  },
  {
    id: "ai_new_directive",
    category: "authority_impersonation",
    pattern: "(?:new|updated?)\\s+directive\\s+from\\s+(?:engineering|development|admin|management|security)\\s+team",
  },
  {
    id: "ai_override_command",
    category: "authority_impersonation",
    pattern: "(?:admin|system|security|master)\\s*[-_]?\\s*override",
  },
  // external_anomalies
  {
    id: "ea_data_exfil_email",
    category: "external_anomalies",
    pattern: "(?:forward|send|email|transmit|exfiltrate|leak)\\s+(?:all\\s+)?(?:customer|user|private|internal|sensitive|confidential)?\\s*(?:data|information|records|credentials|passwords|keys|tokens)\\s+to\\s+\\S+@\\S+",
  },
  {
    id: "ea_data_exfil_url",
    category: "external_anomalies",
    pattern: "(?:post|send|upload|transmit|forward)\\s+(?:all\\s+)?(?:data|information|records|responses?)\\s+to\\s+https?://",
  },
  {
    id: "ea_grant_access",
    category: "external_anomalies",
    pattern: "(?:grant|give|assign|add)\\s+(?:admin|root|full|elevated)\\s+(?:access|permissions?|privileges?|rights?)\\s+to\\s+(?:user|account|id)\\s+",
  },
  {
    id: "ea_encoded_instructions",
    category: "external_anomalies",
    pattern: "(?:execute|run|eval|decode)\\s+(?:the\\s+)?(?:following\\s+)?(?:base64|encoded|hex)\\s*:",
  },
  // hidden_text
  {
    id: "ht_zero_width",
    category: "hidden_text",
    pattern: "[\\u200b\\u200c\\u200d\\u200e\\u200f\\u2060\\u2061\\u2062\\u2063\\u2064\\ufeff]{2,}",
  },
  {
    id: "ht_tag_like_injection",
    category: "hidden_text",
    pattern: "<\\s*(?:system|admin|instruction|prompt|override|ignore)\\s*>",
  },
];
