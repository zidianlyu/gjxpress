/**
 * Tracking number candidate normalization and validation utilities.
 * Used by the barcode scanner to filter out non-tracking-number barcodes.
 */

/**
 * Normalize a raw barcode value: trim whitespace, remove internal spaces.
 */
export function normalizeTrackingCandidate(raw: string): string {
  return raw.trim().replace(/\s+/g, '');
}

/**
 * Determine if a normalized value is likely a domestic tracking number.
 *
 * Rules:
 * - Pure digits: length 10–20
 * - Alphanumeric (may include hyphens): length 10–32
 * - Rejects values shorter than 10 characters (e.g. order numbers like "3295261")
 *
 * This is intentionally permissive to support various courier formats
 * (SF Express, YTO, ZTO, STO, Yunda, JD Logistics, etc.)
 */
export function isLikelyDomesticTrackingNumber(value: string): boolean {
  if (!value || value.length < 10) return false;

  // Pure digits: 10–20
  if (/^[0-9]{10,20}$/.test(value)) return true;

  // Alphanumeric with optional hyphens: 10–32
  if (/^[A-Za-z0-9-]{10,32}$/.test(value)) return true;

  return false;
}
