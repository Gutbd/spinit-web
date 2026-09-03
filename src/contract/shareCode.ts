/**
 * Canonical share-code extraction/normalization — the web counterpart of Android's
 * `LiveShare.extractCode` plus its own input-validation rules (spinit-track share/LiveShare.kt).
 *
 * Accepts a bare 8-char hex code or a pasted spectator URL, tolerant of BOTH the legacy
 * `spinit.com.br/live/{code}` host and the canonical `live.spinit.com.br/live/{code}` host
 * chosen for this Web build (see the Part 4 implementation report §21/§27/§31 — Android still
 * emits the legacy host until the coordinated URL-host change is approved and applied there).
 */

const KNOWN_HOSTS = ["https://spinit.com.br/live/", "https://live.spinit.com.br/live/"];

const SHARE_CODE_PATTERN = /^[0-9A-F]{8}$/;

export type ShareCodeResult =
  | { valid: true; code: string }
  | { valid: false };

/** Strips a known host prefix (if present), a trailing path/query/fragment, and whitespace —
 * does not itself validate shape (mirrors Android's `extractCode`, which is also shape-agnostic). */
export function extractCode(input: string): string {
  const trimmed = input.trim();
  const withoutPrefix = KNOWN_HOSTS.reduce<string | null>((found, host) => {
    if (found !== null) return found;
    return trimmed.toLowerCase().startsWith(host.toLowerCase())
      ? trimmed.slice(host.length)
      : null;
  }, null) ?? trimmed;

  return withoutPrefix.split(/[?#/]/)[0] ?? "";
}

/** Extracts, uppercases, and validates as an 8-char hex code. This is the function UI code
 * should call — it both normalizes and reports validity. */
export function normalizeShareCode(input: string): ShareCodeResult {
  const extracted = extractCode(input).toUpperCase();
  if (SHARE_CODE_PATTERN.test(extracted)) {
    return { valid: true, code: extracted };
  }
  return { valid: false };
}
