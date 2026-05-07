import { CUSTOMER_SHIPMENT_STATUS_LABELS } from '@/lib/constants/status';
import { formatMasterShipmentType } from '@/lib/master-shipment-types';
import { formatMasterShipmentStatus as formatMasterStatus } from '@/lib/master-shipment-status';

export { formatMasterShipmentType };

export function formatMasterShipmentVendor(value?: string | null): string {
  if (!value) return '-';
  if (value === 'DHL' || value === 'UPS' || value === 'FEDEX' || value === 'EMS' || value === 'OTHER') {
    return value;
  }
  return value;
}

export function formatMasterShipmentStatus(value?: string | null): string {
  if (!value) return '-';
  return formatMasterStatus(value);
}

export function formatCustomerShipmentStatus(value?: string | null): string {
  if (!value) return '-';
  return CUSTOMER_SHIPMENT_STATUS_LABELS[value] || value;
}

export function normalizeTrackingQuery(input: string): string {
  return input.trim().toUpperCase();
}

export function formatPublicDateTime(value?: string | null): string {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleString('zh-CN');
}

export function unwrapApiList<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (!value || typeof value !== 'object') return [];

  const record = value as {
    data?: unknown;
    item?: unknown;
    items?: unknown;
    result?: unknown;
  };

  if (Array.isArray(record.items)) return record.items as T[];
  if (record.data != null) return unwrapApiList<T>(record.data);
  if (record.item != null) return unwrapApiList<T>(record.item);
  if (record.result != null) return unwrapApiList<T>(record.result);
  return [];
}

export function unwrapApiItem<T>(value: unknown): T | null {
  if (!value || typeof value !== 'object') return value as T | null;
  const record = value as {
    data?: unknown;
    item?: unknown;
    result?: unknown;
  };
  if (record.data != null) return unwrapApiItem<T>(record.data);
  if (record.item != null) return unwrapApiItem<T>(record.item);
  if (record.result != null) return unwrapApiItem<T>(record.result);
  return value as T;
}
