// Status label mappings for orders, packages, payments, and exceptions

export const ORDER_STATUS_LABELS: Record<string, string> = {
  UNINBOUND: '未入库',
  INBOUNDED: '已入库',
  USER_CONFIRM_PENDING: '待用户确认',
  REVIEW_PENDING: '待审核',
  PAYMENT_PENDING: '待支付',
  PAID: '已支付',
  READY_TO_SHIP: '待发货',
  SHIPPED: '已发货',
  COMPLETED: '已完成',
  EXCEPTION: '异常处理中',
};

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  UNPAID: '未支付',
  PROCESSING: '支付处理中',
  PAID: '已支付',
};

export const PACKAGE_STATUS_LABELS: Record<string, string> = {
  CREATED: '已创建',
  INBOUNDED: '已入库',
  USER_CONFIRM_PENDING: '待用户确认',
  CONFIRMED: '已确认',
  EXCEPTION: '异常',
  SHIPPED: '已发货',
};

export const EXCEPTION_STATUS_LABELS: Record<string, string> = {
  OPEN: '待处理',
  PROCESSING: '处理中',
  RESOLVED: '已解决',
};

export const EXCEPTION_TYPE_LABELS: Record<string, string> = {
  MISSING_ITEM: '少件',
  WRONG_ITEM: '错货',
  DAMAGED: '破损',
  RESTRICTED: '疑似禁运或敏感物品',
  OTHER: '其他',
};

export const SHIPMENT_PROVIDER_LABELS: Record<string, string> = {
  UPS: 'UPS',
  DHL: 'DHL',
  EMS: 'EMS',
  AIR: '空运',
  SEA: '海运',
  OTHER: '其他',
};

export const IMAGE_TYPE_LABELS: Record<string, string> = {
  OUTER: '外包装',
  LABEL: '面单',
  INNER: '内部物品',
  EXCEPTION: '异常照片',
};

// Status colors for badges
export const ORDER_STATUS_COLORS: Record<string, string> = {
  UNINBOUND: 'bg-gray-100 text-gray-700',
  INBOUNDED: 'bg-blue-100 text-blue-700',
  USER_CONFIRM_PENDING: 'bg-yellow-100 text-yellow-700',
  REVIEW_PENDING: 'bg-orange-100 text-orange-700',
  PAYMENT_PENDING: 'bg-red-100 text-red-700',
  PAID: 'bg-green-100 text-green-700',
  READY_TO_SHIP: 'bg-cyan-100 text-cyan-700',
  SHIPPED: 'bg-purple-100 text-purple-700',
  COMPLETED: 'bg-emerald-100 text-emerald-700',
  EXCEPTION: 'bg-rose-100 text-rose-700',
};

export const PAYMENT_STATUS_COLORS: Record<string, string> = {
  UNPAID: 'bg-red-100 text-red-700',
  PROCESSING: 'bg-yellow-100 text-yellow-700',
  PAID: 'bg-green-100 text-green-700',
};

export const EXCEPTION_STATUS_COLORS: Record<string, string> = {
  OPEN: 'bg-red-100 text-red-700',
  PROCESSING: 'bg-yellow-100 text-yellow-700',
  RESOLVED: 'bg-green-100 text-green-700',
};
