import type { CustomerShipment } from '@/types/admin';

export type PaymentOrderType = 'SHIPPING_FEE' | 'REFUND';

function parseStrictPositiveDecimal(value: string | number | null | undefined): number | null {
  if (value == null) return null;
  const text = String(value).trim();
  if (!/^(?:0|[1-9]\d*)(?:\.\d+)?$/.test(text)) return null;
  const parsed = Number(text);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export function computeShipmentPayableAmountYuan(shipment: CustomerShipment): string | null {
  const rate = parseStrictPositiveDecimal(shipment.billingRateCnyPerKg);
  const weight = parseStrictPositiveDecimal(shipment.billingWeightKg);
  if (rate == null || weight == null) return null;
  return (rate * weight).toFixed(2);
}

export function yuanStringToCents(value: string): number | null {
  const trimmed = value.trim();
  if (!/^(?:0|[1-9]\d*)(?:\.\d{1,2})?$/.test(trimmed)) return null;
  const [yuanPart, centPart = ''] = trimmed.split('.');
  const yuan = Number(yuanPart);
  if (!Number.isSafeInteger(yuan)) return null;
  const cents = Number(centPart.padEnd(2, '0'));
  const total = yuan * 100 + cents;
  return total > 0 && Number.isSafeInteger(total) ? total : null;
}

export function centsToYuanText(amountCents: number): string {
  return `¥${(amountCents / 100).toFixed(2)}`;
}

export function formatTransactionType(type: string): string {
  if (type === 'SHIPPING_FEE') return '运费';
  if (type === 'REFUND') return '退款';
  return type;
}

export function isUnpaidShipment(shipment: CustomerShipment): boolean {
  const status = shipment.paymentStatus;
  return status == null || status === '' || status === 'UNPAID' || status === 'PENDING';
}
