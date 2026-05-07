export const SHIPMENT_TYPE_OPTIONS = [
  { value: 'AIR_GENERAL', label: '空运普货' },
  { value: 'AIR_SENSITIVE', label: '空运敏货' },
  { value: 'SEA', label: '海运' },
] as const;

export type ShipmentType = (typeof SHIPMENT_TYPE_OPTIONS)[number]['value'];

export function isShipmentType(value: string | null | undefined): value is ShipmentType {
  return SHIPMENT_TYPE_OPTIONS.some((option) => option.value === value);
}

export function formatShipmentType(value?: string | null): string {
  switch (value) {
    case 'AIR_GENERAL':
      return '空运普货';
    case 'AIR_SENSITIVE':
      return '空运敏货';
    case 'SEA':
      return '海运';
    default:
      return '空运普货';
  }
}
