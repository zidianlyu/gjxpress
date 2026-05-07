export type MasterShipmentStatus = 'IN_TRANSIT' | 'SIGNED' | 'READY_FOR_PICKUP' | 'EXCEPTION';

export const MASTER_SHIPMENT_STATUS_LABELS: Record<MasterShipmentStatus, string> = {
  IN_TRANSIT: '运输中',
  SIGNED: '已签收',
  READY_FOR_PICKUP: '待客人领取',
  EXCEPTION: '异常',
};

export const MASTER_SHIPMENT_STATUS_COLORS: Record<MasterShipmentStatus, string> = {
  IN_TRANSIT: 'bg-cyan-100 text-cyan-700',
  SIGNED: 'bg-green-100 text-green-700',
  READY_FOR_PICKUP: 'bg-amber-100 text-amber-700',
  EXCEPTION: 'bg-rose-100 text-rose-700',
};

export function normalizeMasterShipmentStatus(value?: string | null): MasterShipmentStatus {
  if (value === 'SIGNED' || value === 'DELIVERED' || value === 'ARRIVED' || value === 'ARRIVED_OVERSEAS') return 'SIGNED';
  if (value === 'READY_FOR_PICKUP') return 'READY_FOR_PICKUP';
  if (value === 'EXCEPTION') return 'EXCEPTION';
  return 'IN_TRANSIT';
}

export function formatMasterShipmentStatus(value?: string | null): string {
  return MASTER_SHIPMENT_STATUS_LABELS[normalizeMasterShipmentStatus(value)];
}
