import type { CustomerShipment } from '@/types/admin';
import { normalizePaymentStatus } from '@/lib/customer-shipment-status';
import { formatShipmentType } from '@/lib/shipment-types';

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

export function formatShortMonthDayTime(value?: string | null): string {
  if (!value) return '未知时间';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '未知时间';
  const pad = (num: number) => String(num).padStart(2, '0');
  return `${pad(date.getMonth() + 1)}/${pad(date.getDate())}-${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function formatTransactionSubtitle(transaction: {
  createdAt?: string | null;
  customerShipment?: {
    shipmentType?: string | null;
    customer?: {
      customerCode?: string | null;
    } | null;
  } | null;
}): string {
  const customerCode = transaction.customerShipment?.customer?.customerCode || '未知客户';
  const timeText = formatShortMonthDayTime(transaction.createdAt);
  const typeText = formatShipmentType(transaction.customerShipment?.shipmentType);
  return `${customerCode}-${timeText}-${typeText}`;
}

export function isUnpaidShipment(shipment: CustomerShipment): boolean {
  return normalizePaymentStatus(shipment.paymentStatus) === 'UNPAID';
}
