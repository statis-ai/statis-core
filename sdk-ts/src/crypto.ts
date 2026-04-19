/**
 * Ed25519 receipt verification — TypeScript SDK side.
 *
 * Uses Node's built-in crypto (Node 18+). The canonical signing payload
 * shape must match the Python implementation in
 * api/app/crypto/signing.py::canonical_signing_payload — any drift in
 * field order, types, or coercion breaks cross-implementation verification.
 *
 * AARM R5 (arxiv:2602.09433 §VII.B.R5) — "Public keys available for
 * offline verification".
 */
import { createPublicKey, verify as cryptoVerify } from "crypto";

import type { Receipt } from "./types";

const SIGNING_SCHEMA_VERSION = 1;

export interface VerifyResult {
  valid: boolean;
  reason?: string;
}

function b64uDecode(s: string): Buffer {
  const pad = "=".repeat((4 - (s.length % 4)) % 4);
  return Buffer.from(s + pad, "base64url");
}

function canonicalJson(obj: Record<string, unknown>): string {
  // Sort keys, compact separators — must byte-for-byte match the Python side.
  const sorted: Record<string, unknown> = {};
  Object.keys(obj)
    .sort()
    .forEach((k) => {
      sorted[k] = obj[k];
    });
  return JSON.stringify(sorted).replace(/ /g, "");
}

/**
 * Verify a receipt's Ed25519 signature against a PEM-encoded public key.
 *
 * Returns `{valid: true}` on success, `{valid: false, reason}` on any
 * failure (missing signature, wrong algorithm, signature mismatch, or
 * malformed key material). Never throws — callers should handle the
 * `valid` field rather than try/catch.
 */
export function verifyReceiptOffline(
  receipt: Receipt,
  publicKeyPem: string
): VerifyResult {
  const sig = (receipt as Receipt & { signature?: string | null }).signature;
  const alg = (receipt as Receipt & { signature_alg?: string | null })
    .signature_alg;
  const pkid =
    (receipt as Receipt & { public_key_id?: string | null }).public_key_id ??
    "";

  if (!sig || !alg) {
    return {
      valid: false,
      reason: "Receipt has no Ed25519 signature (legacy or unsigned).",
    };
  }
  if (!alg.startsWith("ed25519")) {
    return { valid: false, reason: `Unsupported signature algorithm: ${alg}` };
  }

  let pubKey;
  try {
    pubKey = createPublicKey({ key: publicKeyPem, format: "pem" });
  } catch (e) {
    return {
      valid: false,
      reason: `Could not load public key PEM: ${(e as Error).message}`,
    };
  }
  if (pubKey.asymmetricKeyType !== "ed25519") {
    return { valid: false, reason: "Public key is not Ed25519" };
  }

  let sigBytes: Buffer;
  try {
    sigBytes = b64uDecode(sig);
  } catch (e) {
    return {
      valid: false,
      reason: `Signature is not valid base64url: ${(e as Error).message}`,
    };
  }

  const createdAtIso =
    receipt.created_at instanceof Date
      ? receipt.created_at.toISOString()
      : String(receipt.created_at);

  const message = Buffer.from(
    canonicalJson({
      v: SIGNING_SCHEMA_VERSION,
      receipt_id: receipt.receipt_id,
      action_id: receipt.action_id,
      decision: receipt.decision,
      rule_id: receipt.rule_id,
      rule_version: receipt.rule_version,
      hash: receipt.hash,
      created_at: createdAtIso,
      public_key_id: pkid,
    }),
    "utf-8"
  );

  const ok = cryptoVerify(null, message, pubKey, sigBytes);
  return ok ? { valid: true } : { valid: false, reason: "Signature does not match" };
}
