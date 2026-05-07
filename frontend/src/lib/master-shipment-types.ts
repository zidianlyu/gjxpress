export type MasterShipmentType = 'AIR_GENERAL' | 'AIR_SENSITIVE' | 'SEA';

export const MASTER_SHIPMENT_TYPE_OPTIONS: { value: MasterShipmentType; label: string }[] = [
  { value: 'AIR_GENERAL', label: '空运普货' },
  { value: 'AIR_SENSITIVE', label: '空运敏货' },
  { value: 'SEA', label: '海运' },
];

export function formatMasterShipmentType(value?: string | null): string {
  return MASTER_SHIPMENT_TYPE_OPTIONS.find((option) => option.value === value)?.label || '空运普货';
}
