// Status label mappings for Web Logistics Phase 1

export const INBOUND_PACKAGE_STATUS_LABELS: Record<string, string> = {
  UNCLAIMED: '待识别',
  CLAIMED: '已归属客户',
  PREALERTED_NOT_ARRIVED: '已预报，未入库',
  ARRIVED_WAREHOUSE: '已入库',
  PENDING_CONFIRMATION: '待确认',
  CONFIRMED: '已确认',
  ISSUE_REPORTED: '已反馈异常',
  CONSOLIDATED: '已合箱',
  INBOUND_EXCEPTION: '入库异常',
};

export const CUSTOMER_SHIPMENT_STATUS_LABELS: Record<string, string> = {
  DRAFT: '待打包',
  PACKED: '已打包',
  SENT_TO_OVERSEAS: '已发往海外仓',
  ARRIVED_OVERSEAS: '已到达海外仓',
  READY_FOR_PICKUP: '待自提',
  LOCAL_DELIVERY_REQUESTED: '已申请本地递送',
  LOCAL_DELIVERY_IN_PROGRESS: '本地递送中',
  PICKED_UP: '收件人已取货',
  COMPLETED: '已完成',
  EXCEPTION: '异常',
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
  UNCLAIMED: 'bg-yellow-100 text-yellow-700',
  CLAIMED: 'bg-blue-100 text-blue-700',
  PREALERTED_NOT_ARRIVED: 'bg-gray-100 text-gray-700',
  ARRIVED_WAREHOUSE: 'bg-green-100 text-green-700',
  PENDING_CONFIRMATION: 'bg-orange-100 text-orange-700',
  CONFIRMED: 'bg-emerald-100 text-emerald-700',
  ISSUE_REPORTED: 'bg-rose-100 text-rose-700',
  CONSOLIDATED: 'bg-purple-100 text-purple-700',
  INBOUND_EXCEPTION: 'bg-red-100 text-red-700',
};

export const CUSTOMER_SHIPMENT_STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  PACKED: 'bg-blue-100 text-blue-700',
  SENT_TO_OVERSEAS: 'bg-cyan-100 text-cyan-700',
  ARRIVED_OVERSEAS: 'bg-teal-100 text-teal-700',
  READY_FOR_PICKUP: 'bg-green-100 text-green-700',
  LOCAL_DELIVERY_REQUESTED: 'bg-indigo-100 text-indigo-700',
  LOCAL_DELIVERY_IN_PROGRESS: 'bg-violet-100 text-violet-700',
  PICKED_UP: 'bg-emerald-100 text-emerald-700',
  COMPLETED: 'bg-emerald-100 text-emerald-700',
  EXCEPTION: 'bg-rose-100 text-rose-700',
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

// Generic status label getter with fallback
export function getStatusLabel(status: string, labelMap: Record<string, string>): string {
  return labelMap[status] || status;
}
