import { SHIPMENT_TYPE_OPTIONS, formatShipmentType, type ShipmentType } from '@/lib/shipment-types';

export type MasterShipmentType = ShipmentType;

export const MASTER_SHIPMENT_TYPE_OPTIONS = SHIPMENT_TYPE_OPTIONS;

export function formatMasterShipmentType(value?: string | null): string {
  return formatShipmentType(value);
}
