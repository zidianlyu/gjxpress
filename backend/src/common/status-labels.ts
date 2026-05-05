import {
  InboundPackageStatus,
  CustomerShipmentStatus,
  MasterShipmentStatus,
  PaymentStatus,
} from '@prisma/client';

export const INBOUND_PACKAGE_STATUS_LABELS: Record<InboundPackageStatus, string> = {
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

export const CUSTOMER_SHIPMENT_STATUS_LABELS: Record<CustomerShipmentStatus, string> = {
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

export const MASTER_SHIPMENT_STATUS_LABELS: Record<MasterShipmentStatus, string> = {
  CREATED: '已创建',
  HANDED_TO_VENDOR: '已交供应商',
  IN_TRANSIT: '运输中',
  TRANSFER_OR_CUSTOMS_PROCESSING: '转运处理中',
  ARRIVED_OVERSEAS: '已到达海外仓',
  CLOSED: '已关闭',
  EXCEPTION: '异常',
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  UNPAID: '未支付',
  PROCESSING: '支付处理中',
  PENDING: '支付处理中',
  PAID: '已支付',
  WAIVED: '已免除',
  REFUNDED: '已退款',
};

export function getInboundPackageStage(status: InboundPackageStatus): string {
  switch (status) {
    case 'UNCLAIMED':
    case 'CLAIMED':
    case 'PREALERTED_NOT_ARRIVED':
    case 'ARRIVED_WAREHOUSE':
    case 'PENDING_CONFIRMATION':
    case 'CONFIRMED':
    case 'ISSUE_REPORTED':
    case 'INBOUND_EXCEPTION':
      return '国内仓';
    case 'CONSOLIDATED':
      return '待发运';
    default:
      return '国内仓';
  }
}

export function getCustomerShipmentStage(status: CustomerShipmentStatus): string {
  switch (status) {
    case 'DRAFT':
    case 'PACKED':
      return '国内仓';
    case 'SENT_TO_OVERSEAS':
      return '国际运输';
    case 'ARRIVED_OVERSEAS':
    case 'READY_FOR_PICKUP':
      return '海外仓';
    case 'LOCAL_DELIVERY_REQUESTED':
    case 'LOCAL_DELIVERY_IN_PROGRESS':
      return '本地递送';
    case 'PICKED_UP':
    case 'COMPLETED':
      return '已完成';
    case 'EXCEPTION':
      return '异常';
    default:
      return '未知';
  }
}
