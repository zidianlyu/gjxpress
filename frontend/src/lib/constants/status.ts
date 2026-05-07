// Status label mappings for Web Logistics Phase 1

export const INBOUND_PACKAGE_STATUS_LABELS: Record<string, string> = {
  UNIDENTIFIED: '未识别',
  ARRIVED: '已入库',
  CONSOLIDATED: '已合箱',
  UNCLAIMED: '未识别',
  PREALERTED_NOT_ARRIVED: '未识别',
  CLAIMED: '已入库',
  ARRIVED_WAREHOUSE: '已入库',
  PENDING_CONFIRMATION: '已入库',
  CONFIRMED: '已入库',
  ISSUE_REPORTED: '已入库',
  INBOUND_EXCEPTION: '已入库',
};

export const CUSTOMER_SHIPMENT_STATUS_LABELS: Record<string, string> = {
  PACKED: '已打包',
  SHIPPED: '已发货',
  ARRIVED: '已到达',
  READY_FOR_PICKUP: '待自提',
  PICKED_UP: '已取货',
  EXCEPTION: '异常',
  DRAFT: '已打包',
  SENT_TO_OVERSEAS: '已发货',
  ARRIVED_OVERSEAS: '已到达',
  LOCAL_DELIVERY_REQUESTED: '待自提',
  LOCAL_DELIVERY_IN_PROGRESS: '待自提',
  COMPLETED: '已取货',
};

export const MASTER_SHIPMENT_STATUS_LABELS: Record<string, string> = {
  CREATED: '已创建',
  HANDED_TO_VENDOR: '已交供应商',
  IN_TRANSIT: '运输中',
  TRANSFER_OR_CUSTOMS_PROCESSING: '转运处理中',
  ARRIVED_OVERSEAS: '已到达海外仓',
  CLOSED: '已关闭',
  EXCEPTION: '异常',
};

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  UNPAID: '未支付',
  PENDING: '支付处理中',
  PAID: '已支付',
  WAIVED: '已免除',
  REFUNDED: '已退款',
};

export const TRANSACTION_TYPE_LABELS: Record<string, string> = {
  SHIPPING_FEE: '运费',
  REFUND: '退款',
};

// Status colors for badges
export const INBOUND_PACKAGE_STATUS_COLORS: Record<string, string> = {
  UNIDENTIFIED: 'bg-yellow-100 text-yellow-700',
  ARRIVED: 'bg-green-100 text-green-700',
  CONSOLIDATED: 'bg-blue-100 text-blue-700',
  UNCLAIMED: 'bg-yellow-100 text-yellow-700',
  PREALERTED_NOT_ARRIVED: 'bg-yellow-100 text-yellow-700',
  CLAIMED: 'bg-green-100 text-green-700',
  ARRIVED_WAREHOUSE: 'bg-green-100 text-green-700',
  PENDING_CONFIRMATION: 'bg-green-100 text-green-700',
  CONFIRMED: 'bg-green-100 text-green-700',
  ISSUE_REPORTED: 'bg-green-100 text-green-700',
  INBOUND_EXCEPTION: 'bg-green-100 text-green-700',
};

export const CUSTOMER_SHIPMENT_STATUS_COLORS: Record<string, string> = {
  PACKED: 'bg-blue-100 text-blue-700',
  SHIPPED: 'bg-cyan-100 text-cyan-700',
  ARRIVED: 'bg-teal-100 text-teal-700',
  READY_FOR_PICKUP: 'bg-green-100 text-green-700',
  PICKED_UP: 'bg-emerald-100 text-emerald-700',
  EXCEPTION: 'bg-rose-100 text-rose-700',
  DRAFT: 'bg-blue-100 text-blue-700',
  SENT_TO_OVERSEAS: 'bg-cyan-100 text-cyan-700',
  ARRIVED_OVERSEAS: 'bg-teal-100 text-teal-700',
  LOCAL_DELIVERY_REQUESTED: 'bg-green-100 text-green-700',
  LOCAL_DELIVERY_IN_PROGRESS: 'bg-green-100 text-green-700',
  COMPLETED: 'bg-emerald-100 text-emerald-700',
};

export const MASTER_SHIPMENT_STATUS_COLORS: Record<string, string> = {
  CREATED: 'bg-gray-100 text-gray-700',
  HANDED_TO_VENDOR: 'bg-blue-100 text-blue-700',
  IN_TRANSIT: 'bg-cyan-100 text-cyan-700',
  TRANSFER_OR_CUSTOMS_PROCESSING: 'bg-orange-100 text-orange-700',
  ARRIVED_OVERSEAS: 'bg-green-100 text-green-700',
  CLOSED: 'bg-slate-100 text-slate-700',
  EXCEPTION: 'bg-rose-100 text-rose-700',
};

export const PAYMENT_STATUS_COLORS: Record<string, string> = {
  UNPAID: 'bg-red-100 text-red-700',
  PENDING: 'bg-yellow-100 text-yellow-700',
  PAID: 'bg-green-100 text-green-700',
  WAIVED: 'bg-slate-100 text-slate-700',
  REFUNDED: 'bg-purple-100 text-purple-700',
};

export const CUSTOMER_REGISTRATION_STATUS_LABELS: Record<string, string> = {
  PENDING: '待审核',
  APPROVED: '已通过',
  REJECTED: '已拒绝',
};

export const CUSTOMER_REGISTRATION_STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
};

// Generic status label getter with fallback
export function getStatusLabel(status: string, labelMap: Record<string, string>): string {
  return labelMap[status] || status;
}

export const INBOUND_PACKAGE_STATUS_OPTIONS = [
  { value: 'UNIDENTIFIED', label: '未识别' },
  { value: 'ARRIVED', label: '已入库' },
  { value: 'CONSOLIDATED', label: '已合箱' },
] as const;

export const CUSTOMER_SHIPMENT_STATUS_OPTIONS = [
  { value: 'PACKED', label: '已打包' },
  { value: 'SHIPPED', label: '已发货' },
  { value: 'ARRIVED', label: '已到达' },
  { value: 'READY_FOR_PICKUP', label: '待自提' },
  { value: 'PICKED_UP', label: '已取货' },
  { value: 'EXCEPTION', label: '异常' },
] as const;

export function normalizeInboundPackageStatus(status: string): 'UNIDENTIFIED' | 'ARRIVED' | 'CONSOLIDATED' {
  if (status === 'CONSOLIDATED') return 'CONSOLIDATED';
  if (status === 'UNCLAIMED' || status === 'PREALERTED_NOT_ARRIVED' || status === 'UNIDENTIFIED') return 'UNIDENTIFIED';
  return 'ARRIVED';
}

export function normalizeCustomerShipmentStatus(status: string): 'PACKED' | 'SHIPPED' | 'ARRIVED' | 'READY_FOR_PICKUP' | 'PICKED_UP' | 'EXCEPTION' {
  if (status === 'SENT_TO_OVERSEAS' || status === 'SHIPPED') return 'SHIPPED';
  if (status === 'ARRIVED_OVERSEAS' || status === 'ARRIVED') return 'ARRIVED';
  if (status === 'READY_FOR_PICKUP' || status === 'LOCAL_DELIVERY_REQUESTED' || status === 'LOCAL_DELIVERY_IN_PROGRESS') return 'READY_FOR_PICKUP';
  if (status === 'PICKED_UP' || status === 'COMPLETED') return 'PICKED_UP';
  if (status === 'EXCEPTION') return 'EXCEPTION';
  return 'PACKED';
}
