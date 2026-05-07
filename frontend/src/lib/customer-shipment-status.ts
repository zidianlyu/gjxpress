export type CustomerShipmentPaymentStatus = 'UNPAID' | 'PAID' | 'REFUNDED';

export const CUSTOMER_SHIPMENT_PAYMENT_STATUS_OPTIONS: Array<{
  value: CustomerShipmentPaymentStatus;
  label: string;
}> = [
  { value: 'UNPAID', label: '未支付' },
  { value: 'PAID', label: '已支付' },
  { value: 'REFUNDED', label: '已退款' },
];

export function normalizePaymentStatus(value?: string | null): CustomerShipmentPaymentStatus {
  if (value === 'PAID') return 'PAID';
  if (value === 'REFUNDED' || value === 'REFUND') return 'REFUNDED';
  return 'UNPAID';
}

export function formatPaymentStatus(value?: string | null): string {
  const normalized = normalizePaymentStatus(value);
  return CUSTOMER_SHIPMENT_PAYMENT_STATUS_OPTIONS.find((option) => option.value === normalized)?.label || '未支付';
}
