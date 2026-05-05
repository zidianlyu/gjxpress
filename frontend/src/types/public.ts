// Public-facing types (no PII)

export type PublicTrackingType =
  | 'DOMESTIC'
  | 'CUSTOMER_SHIPMENT'
  | 'UNKNOWN';

export type PublicTrackingResult = {
  query: string;
  trackingType: PublicTrackingType;
  status: string;
  statusText: string;
  stage: string;
  lastUpdatedAt: string | null;
  message: string;
};

export type PublicBatchUpdate = {
  batchNo: string;
  status: string;
  statusText?: string;
  publicTitle?: string | null;
  publicSummary?: string | null;
  publicStatusText?: string | null;
  publishedAt?: string | null;
  updatedAt?: string | null;
};
