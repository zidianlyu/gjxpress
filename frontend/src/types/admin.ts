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
  phoneCountryCode?: string | null;
  phoneNumber?: string | null;
  wechatId?: string | null;
  domesticReturnAddress?: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateCustomerPayload = {
  phoneCountryCode?: string;
  phoneNumber: string;
  wechatId?: string;
  domesticReturnAddress?: string;
};

export type UpdateCustomerPayload = {
  phoneCountryCode?: string;
  phoneNumber?: string;
  wechatId?: string | null;
  domesticReturnAddress?: string | null;
  status?: 'ACTIVE' | 'DISABLED';
};

// Customer Registration
export type CustomerRegistration = {
  id: string;
  customerCode: string;
  phoneCountryCode?: string | null;
  phoneNumber: string;
  wechatId?: string | null;
  domesticReturnAddress?: string | null;
  status?: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateCustomerRegistrationPayload = {
  phoneCountryCode?: string;
  phoneNumber: string;
  wechatId?: string;
  domesticReturnAddress?: string;
};

export type UpdateCustomerRegistrationPayload = {
  phoneCountryCode?: string;
  phoneNumber?: string;
  wechatId?: string | null;
  domesticReturnAddress?: string | null;
};

export type ApproveCustomerRegistrationResponse = {
  registration?: CustomerRegistration;
  customer?: {
    id: string;
    customerCode: string;
    status?: 'ACTIVE' | 'DISABLED';
  };
};

// Inbound Package
export type InboundPackageStatus = 'UNIDENTIFIED' | 'ARRIVED' | 'CONSOLIDATED';

export type LegacyInboundPackageStatus = 'UNCLAIMED' | 'CLAIMED' | 'PREALERTED_NOT_ARRIVED' | 'ARRIVED_WAREHOUSE' | 'PENDING_CONFIRMATION' | 'CONFIRMED' | 'ISSUE_REPORTED' | 'INBOUND_EXCEPTION';

export type InboundPackage = {
  id: string;
  domesticTrackingNo?: string | null;
  customerId?: string | null;
  status: InboundPackageStatus | LegacyInboundPackageStatus | string;
  customer?: {
    id: string;
    customerCode: string;
    status?: string;
    phoneCountryCode?: string | null;
    phoneNumber?: string | null;
    wechatId?: string | null;
  } | null;
  warehouseReceivedAt?: string | null;
  adminNote?: string | null;
  issueNote?: string | null;
  imageUrls: string[];
  createdAt: string;
  updatedAt: string;
};

export type CreateInboundPackagePayload = {
  domesticTrackingNo?: string | null;
  customerCode: string;
  warehouseReceivedAt?: string;
  adminNote?: string;
};

// Customer Shipment
export type CustomerShipmentStatus = 'PACKED' | 'SHIPPED' | 'ARRIVED' | 'READY_FOR_PICKUP' | 'PICKED_UP' | 'EXCEPTION';

export type LegacyCustomerShipmentStatus = 'DRAFT' | 'SENT_TO_OVERSEAS' | 'ARRIVED_OVERSEAS' | 'LOCAL_DELIVERY_REQUESTED' | 'LOCAL_DELIVERY_IN_PROGRESS' | 'COMPLETED';

export type PaymentStatus = 'UNPAID' | 'PENDING' | 'PAID' | 'WAIVED' | 'REFUNDED';

export type CustomerShipment = {
  id: string;
  shipmentNo?: string | null;
  customerId?: string | null;
  customer?: {
    id: string;
    customerCode: string;
    status?: string;
    phoneCountryCode?: string | null;
    phoneNumber?: string | null;
    wechatId?: string | null;
  } | null;
  masterShipmentId?: string | null;
  status: string;
  paymentStatus?: string | null;
  internationalTrackingNo?: string | null;
  publicTrackingEnabled?: boolean;
  actualWeightKg?: string | number | null;
  volumeFormula?: string | null;
  billingRateCnyPerKg?: string | number | null;
  billingWeightKg?: string | number | null;
  quantity?: number | null;
  imageUrls?: string[];
  notes?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type CreateCustomerShipmentPayload = {
  customerCode: string;
  inboundPackageIds?: string[];
  quantity: number;
  actualWeightKg: string;
  volumeFormula?: string;
  billingRateCnyPerKg: string;
  billingWeightKg: string;
  notes?: string;
};

export type UpdateCustomerShipmentPayload = {
  notes?: string;
  internationalTrackingNo?: string;
  publicTrackingEnabled?: boolean;
  status?: string;
  paymentStatus?: string;
  quantity?: number;
  actualWeightKg?: string | null;
  volumeFormula?: string | null;
  billingRateCnyPerKg?: string | null;
  billingWeightKg?: string | null;
};

// Master Shipment
export type MasterShipmentStatus = 'CREATED' | 'HANDED_TO_VENDOR' | 'IN_TRANSIT' | 'TRANSFER_OR_CUSTOMS_PROCESSING' | 'ARRIVED_OVERSEAS' | 'CLOSED' | 'EXCEPTION';
export type MasterShipmentType = 'AIR_GENERAL' | 'AIR_SENSITIVE' | 'SEA';

export type MasterShipment = {
  id: string;
  batchNo: string;
  shipmentType?: MasterShipmentType | string | null;
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
  shipmentType: MasterShipmentType;
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
  customerId?: string | null;
  customerShipmentId: string;
  type: 'SHIPPING_FEE' | 'REFUND' | string;
  amountCents: number;
  adminNote?: string | null;
  occurredAt?: string;
  createdAt: string;
  updatedAt?: string;
  customer?: {
    id: string;
    customerCode: string;
    phoneCountryCode?: string;
    phoneNumber?: string;
    wechatId?: string | null;
  } | null;
  customerShipment?: {
    id: string;
    shipmentNo?: string | null;
    status?: string;
    customer?: {
      id: string;
      customerCode: string;
    } | null;
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
  deletedImageCount?: number;
};

// Delete blockers (from 409)
export type DeleteBlockers = {
  inboundPackages?: number;
  customerShipments?: number;
  transactions?: number;
};
