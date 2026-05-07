export type MasterShipmentVendor = 'DHL' | 'UPS' | 'FEDEX' | 'EMS' | 'OTHER';

export const MASTER_SHIPMENT_VENDOR_OPTIONS: Array<{
  value: MasterShipmentVendor;
  label: string;
}> = [
  { value: 'DHL', label: 'DHL' },
  { value: 'UPS', label: 'UPS' },
  { value: 'FEDEX', label: 'FEDEX' },
  { value: 'EMS', label: 'EMS' },
  { value: 'OTHER', label: 'OTHER' },
];

export function isMasterShipmentVendor(value: string): value is MasterShipmentVendor {
  return MASTER_SHIPMENT_VENDOR_OPTIONS.some((option) => option.value === value);
}
