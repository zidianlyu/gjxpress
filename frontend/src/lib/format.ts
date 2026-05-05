/**
 * Format amount from cents (分) to RMB display string.
 * e.g. 2500 -> '¥25.00'
 * All amounts in this system are CNY.
 */
export function formatAmountCents(amountCents: number): string {
  const yuan = amountCents / 100;
  return `¥${yuan.toFixed(2)}`;
}

/**
 * Format cents to yuan string for form inputs (no currency symbol).
 * e.g. 2500 -> '25.00'
 */
export function centsToYuan(amountCents: number): string {
  return (amountCents / 100).toFixed(2);
}

/**
 * Parse a yuan amount string to cents (分, integer).
 * Uses string manipulation to avoid floating point errors.
 * e.g. '25.00' -> 2500, '25.5' -> 2550, '25' -> 2500
 */
export function parseYuanToCents(input: string): number {
  const trimmed = input.trim().replace(/[¥￥,\s]/g, '');
  if (!trimmed || isNaN(Number(trimmed))) return 0;
  const parts = trimmed.split('.');
  const integerPart = parseInt(parts[0] || '0', 10);
  let centsPart = 0;
  if (parts[1]) {
    const fractional = parts[1].padEnd(2, '0').slice(0, 2);
    centsPart = parseInt(fractional, 10);
  }
  const sign = integerPart < 0 ? -1 : 1;
  return sign * (Math.abs(integerPart) * 100 + centsPart);
}

/**
 * @deprecated Use parseYuanToCents instead
 */
export const parseDollarsToCents = parseYuanToCents;
