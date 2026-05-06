// Admin-facing types

// Auth
export type AdminLoginRequest = {
  phoneCountryCode?: string;
  phoneNumber: string;
  password: string;
};

export type AdminUser = {
  id: string;
  phoneCountryCode: string;
  phoneNumber: string;
  role: 'OWNER' | 'ADMIN' | 'WAREHOUSE_STAFF' | 'US_STAFF' | 'VIEWER';
  displayName?: string | null;
};

export type AdminLoginResponse = {
  accessToken: string;
  admin: AdminUser;
};

// Customer
export type Customer = {
  id: string;
  customerCode: string;
  phoneCountryCode: string;
  phoneNumber: string;
  wechatId?: string | null;
  domesticReturnAddress?: string | null;
  notes?: string | null;
  status: 'ACTIVE' | 'DISABLED';
  createdAt: string;
  updatedAt?: string;
};

export type CreateCustomerPayload = {
  phoneCountryCode?: string;
  phoneNumber: string;
  wechatId?: string;
  domesticReturnAddress?: string;
  notes?: string;
};

export type UpdateCustomerPayload = {
  phoneCountryCode?: string;
  phoneNumber?: string;
  wechatId?: string | null;
  domesticReturnAddress?: string | null;
  notes?: string | null;
  status?: 'ACTIVE' | 'DISABLED';
};

// Customer Registration
export type CustomerRegistrationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type CustomerRegistration = {
  id: string;
  customerCode: string;
  phoneCountryCode: string;
  phoneNumber: string;
  wechatId?: string | null;
  domesticReturnAddress?: string | null;
  notes?: string | null;
  status: CustomerRegistrationStatus;
  reviewNote?: string | null;
  approvedAt?: string | null;
  rejectedAt?: string | null;
  createdCustomerId?: string | null;
  createdCustomer?: {
    id: string;
    customerCode: string;
  } | null;
  createdAt: string;
  updatedAt?: string;
};

export type CreateCustomerRegistrationPayload = {
  phoneCountryCode?: string;
  phoneNumber: string;
  wechatId?: string;
  domesticReturnAddress?: string;
  notes?: string;
};

export type UpdateCustomerRegistrationPayload = {
  phoneCountryCode?: string;
  phoneNumber?: string;
  wechatId?: string | null;
  domesticReturnAddress?: string | null;
  notes?: string | null;
  reviewNote?: string | null;
};

export type ApproveCustomerRegistrationResponse = {
  registration: CustomerRegistration;
  customer: {
    id: string;
    customerCode: string;
  };
};

// Inbound Package
export type InboundPackageStatus =
  | 'UNCLAIMED'
  | 'CLAIMED'
  | 'PREALERTED_NOT_ARRIVED'
  | 'ARRIVED_WAREHOUSE'
  | 'PENDING_CONFIRMATION'
  | 'CONFIRMED'
  | 'ISSUE_REPORTED'
  | 'CONSOLIDATED'
  | 'INBOUND_EXCEPTION';

export type InboundPackage = {
  id: string;
  domesticTrackingNo?: string | null;
  status: string;
  customer?: {
    id: string;
    customerCode: string;
    phoneNumber?: string;
    wechatId?: string | null;
  } | null;
  warehouseReceivedAt?: string | null;
  adminNote?: string | null;
  issueNote?: string | null;
  imageUrls: string[];
  createdAt: string;
  updatedAt?: string;
};

export type CreateInboundPackagePayload = {
  domesticTrackingNo: string;
  customerCode?: string;
  warehouseReceivedAt?: string;
  adminNote?: string;
};

// Customer Shipment
export type CustomerShipmentStatus =
  | 'DRAFT'
  | 'PACKED'
  | 'SENT_TO_OVERSEAS'
  | 'ARRIVED_OVERSEAS'
  | 'READY_FOR_PICKUP'
  | 'LOCAL_DELIVERY_REQUESTED'
  | 'LOCAL_DELIVERY_IN_PROGRESS'
  | 'PICKED_UP'
  | 'COMPLETED'
  | 'EXCEPTION';

export type PaymentStatus =
  | 'UNPAID'
  | 'PENDING'
  | 'PAID'
  | 'WAIVED'
  | 'REFUNDED';

export type CustomerShipment = {
  id: string;
  shipmentNo: string;
  customer?: Customer;
  status: string;
  paymentStatus: string;
  masterShipmentId?: string | null;
  internationalTrackingNo?: string | null;
  publicTrackingEnabled?: boolean;
  actualWeightKg?: string | number | null;
  volumeFormula?: string | null;
  billingRateCnyPerKg?: string | number | null;
  billingWeightKg?: string | number | null;
  notes?: string | null;
  imageUrls: string[];
  createdAt: string;
  updatedAt?: string;
};

export type CreateCustomerShipmentPayload = {
  customerId: string;
  inboundPackageIds?: string[];
  notes?: string;
  actualWeightKg?: number;
  volumeFormula?: string;
  billingRateCnyPerKg?: number;
  billingWeightKg?: number;
};

export type UpdateCustomerShipmentPayload = {
  notes?: string;
  internationalTrackingNo?: string;
  publicTrackingEnabled?: boolean;
  status?: string;
  paymentStatus?: string;
  actualWeightKg?: number | null;
  volumeFormula?: string | null;
  billingRateCnyPerKg?: number | null;
  billingWeightKg?: number | null;
};

// Master Shipment
export type MasterShipmentStatus =
  | 'CREATED'
  | 'HANDED_TO_VENDOR'
  | 'IN_TRANSIT'
  | 'TRANSFER_OR_CUSTOMS_PROCESSING'
  | 'ARRIVED_OVERSEAS'
  | 'CLOSED'
  | 'EXCEPTION';

export type MasterShipment = {
  id: string;
  batchNo: string;
  vendorName?: string | null;
  vendorTrackingNo?: string | null;
  status: string;
  publicVisible: boolean;
  publicTitle?: string | null;
  publicSummary?: string | null;
  publicStatusText?: string | null;
  publishedAt?: string | null;
  handedToVendorAt?: string | null;
  arrivedOverseasAt?: string | null;
  closedAt?: string | null;
  adminNote?: string | null;
  createdAt: string;
  updatedAt?: string;
  customerShipments?: CustomerShipment[];
};

export type CreateMasterShipmentPayload = {
  vendorName: string;
  vendorTrackingNo: string;
  customerShipmentIds: string[];
  status?: string;
  adminNote?: string;
};

// Transaction Record
export type AdminTransactionType = 'SHIPPING_FEE' | 'REFUND';

export type TransactionRecord = {
  id: string;
  customerId: string;
  customerShipmentId: string;
  type: 'SHIPPING_FEE' | 'REFUND';
  amountCents: number;
  adminNote?: string | null;
  occurredAt: string;
  createdAt: string;
  updatedAt?: string;
  customer?: {
    id: string;
    customerCode: string;
    phoneCountryCode?: string;
    phoneNumber?: string;
    wechatId?: string | null;
  };
  customerShipment?: {
    id: string;
    shipmentNo: string;
    status?: string;
  } | null;
};

export type CreateTransactionPayload = {
  customerShipmentId: string;
  type: 'SHIPPING_FEE' | 'REFUND';
  amountCents: number;
  adminNote?: string;
  occurredAt?: string;
};

export type UpdateTransactionPayload = {
  type?: 'SHIPPING_FEE' | 'REFUND';
  amountCents?: number;
  adminNote?: string | null;
  occurredAt?: string;
};

// Delete response
export type DeleteResponse = {
  deleted: boolean;
  id: string;
};

// Delete blockers (from 409)
export type DeleteBlockers = {
  inboundPackages?: number;
  customerShipments?: number;
  transactions?: number;
};
