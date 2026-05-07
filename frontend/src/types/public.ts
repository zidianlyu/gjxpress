// Public-facing types (no PII)

export type PublicTrackingType =
  | 'DOMESTIC'
  | 'CUSTOMER_SHIPMENT'
  | 'UNKNOWN';

export type PublicTrackingResult = {
  type?: string;
  query?: string | null;
  trackingType?: PublicTrackingType | string;
  shipmentNo?: string | null;
  status?: string | null;
  statusText?: string | null;
  stage?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  lastUpdatedAt?: string | null;
  message?: string | null;
  masterShipment?: {
    vendorName?: string | null;
    vendorTrackingNo?: string | null;
    shipmentType?: string | null;
    status?: string | null;
    updatedAt?: string | null;
  } | null;
  timeline?: Array<{
    label: string;
    status?: string | null;
    time?: string | null;
  }>;
};

export type PublicBatchUpdate = {
  batchNo?: string | null;
  vendorName?: string | null;
  vendorTrackingNo?: string | null;
  shipmentType?: 'AIR_GENERAL' | 'AIR_SENSITIVE' | 'SEA' | string | null;
  status?: string | null;
  publicPublished?: boolean;
  customerShipmentCount?: number | null;
  statusText?: string;
  createdAt?: string | null;
  publishedAt?: string | null;
  updatedAt?: string | null;
};

export type PublicCustomerRegistrationResponse = {
  id: string;
  customerCode: string;
  status: 'PENDING';
  message: string;
};
