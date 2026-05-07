export function sanitizeDecimalString(value: string): string {
  return value.trim();
}

export function isPositiveDecimalString(value: string): boolean {
  const trimmed = sanitizeDecimalString(value);
  if (!/^(?:0|[1-9]\d*)(?:\.\d+)?$/.test(trimmed)) return false;
  return Number(trimmed) > 0;
}

export function parseDecimalForDisplay(value: string): number | null {
  const trimmed = sanitizeDecimalString(value);
  if (!isPositiveDecimalString(trimmed)) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

export function formatPayableAmount(rateValue: string, weightValue: string): string | null {
  const rate = parseDecimalForDisplay(rateValue);
  const weight = parseDecimalForDisplay(weightValue);
  if (rate == null || weight == null) return null;
  return `¥${(rate * weight).toFixed(2)}`;
}

function formatTimeInZone(now: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(now);

  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value || '';

  return `${get('year')}/${get('month')}/${get('day')} ${get('hour')}:${get('minute')}`;
}

export function buildDefaultShipmentNotes(customerCode: string, payableText: string, now = new Date()): string {
  const cnTime = formatTimeInZone(now, 'Asia/Shanghai');
  const usTime = formatTimeInZone(now, 'America/Los_Angeles');
  const normalizedCustomerCode = customerCode.trim() || '???';
  return `${normalizedCustomerCode}于中国时间：${cnTime}；美国西部时间：${usTime}出单。\n应付费用：${payableText}`;
}

export function ensurePayableAmountLine(notes: string, payableText: string): string {
  const lines = notes
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .filter((line) => !/^应付费用：/.test(line));

  lines.push(`应付费用：${payableText}`);
  return lines.join('\n').trim();
}
