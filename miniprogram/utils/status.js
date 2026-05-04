const ORDER_STATUS_LABELS = {
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

const PAYMENT_STATUS_LABELS = {
  UNPAID: '未支付',
  PROCESSING: '支付处理中',
  PAID: '已支付',
};

const PACKAGE_STATUS_LABELS = {
  CREATED: '已创建',
  INBOUNDED: '已入库',
  USER_CONFIRM_PENDING: '待用户确认',
  CONFIRMED: '已确认',
  EXCEPTION: '异常处理中',
  CONSOLIDATED: '已合单',
  SHIPPED: '已发货',
};

const ORDER_STATUS_TYPES = {
  UNINBOUND: 'normal',
  INBOUNDED: 'normal',
  USER_CONFIRM_PENDING: 'warning',
  REVIEW_PENDING: 'warning',
  PAYMENT_PENDING: 'warning',
  PAID: 'success',
  READY_TO_SHIP: 'success',
  SHIPPED: 'primary',
  COMPLETED: 'success',
  EXCEPTION: 'danger',
};

const PAYMENT_STATUS_TYPES = {
  UNPAID: 'warning',
  PROCESSING: 'warning',
  PAID: 'success',
};

const PACKAGE_STATUS_TYPES = {
  CREATED: 'normal',
  INBOUNDED: 'normal',
  USER_CONFIRM_PENDING: 'warning',
  CONFIRMED: 'success',
  EXCEPTION: 'danger',
  CONSOLIDATED: 'success',
  SHIPPED: 'primary',
};

function getPackageStatusType(status) {
  return PACKAGE_STATUS_TYPES[status] || 'normal';
}

function getOrderStatusLabel(status) {
  return ORDER_STATUS_LABELS[status] || '未知状态';
}

function getPaymentStatusLabel(status) {
  return PAYMENT_STATUS_LABELS[status] || '未知状态';
}

function getPackageStatusLabel(status) {
  return PACKAGE_STATUS_LABELS[status] || '未知状态';
}

function getOrderStatusType(status) {
  return ORDER_STATUS_TYPES[status] || 'normal';
}

function getPaymentStatusType(status) {
  return PAYMENT_STATUS_TYPES[status] || 'normal';
}

module.exports = {
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  PACKAGE_STATUS_LABELS,
  ORDER_STATUS_TYPES,
  PAYMENT_STATUS_TYPES,
  PACKAGE_STATUS_TYPES,
  getOrderStatusLabel,
  getPaymentStatusLabel,
  getPackageStatusLabel,
  getOrderStatusType,
  getPaymentStatusType,
  getPackageStatusType,
};
